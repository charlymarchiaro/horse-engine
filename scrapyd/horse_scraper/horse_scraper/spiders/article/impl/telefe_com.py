from typing import Tuple, List, Dict, Any, Union, Callable, cast

import json
import html
import dateparser  # type: ignore
from datetime import datetime, date, timedelta
from string import whitespace
import re

from scrapy.http import Request, HtmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import Rule  # type: ignore

from horse_scraper.items import Article
from horse_scraper.spiders.article.model import ArticleData, SpiderType
from horse_scraper.spiders.article.base_article_spider_params import (
    BaseArticleSpiderParams,
    UrlFilter,
)
from horse_scraper.services.utils.parse_utils import (
    extract_all_text,
    AttributeType,
    get_publishing_date,
)
from ..base_article_crawl_spider import BaseArticleCrawlSpider
from ..base_article_sitemap_spider import BaseArticleSitemapSpider


class Params(BaseArticleSpiderParams):
    def _after_initialize(self) -> None:
        # Enable Splash to parse dynamically loaded content
        self.splash_enabled = True
        self.splash_wait_time = 2.5

    # Common params
    def _get_spider_base_name(self) -> str:
        return "telefe_com"

    def get_allowed_domains(self) -> List[str]:
        return ["telefe.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://telefe.com/",
            "https://telefe.com/entretenimientos/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*telefe.com\/.+\/.+\/.{15,}\/$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return []

    def get_sitemap_follow(self) -> List[str]:
        return [".*"]

    def should_parse_sitemap_entry(self, entry: Any) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    def should_follow_article_url(self, url: str) -> bool:
        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
            self.parser_2,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "editorialPage_body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        # last_updated
        escaped_url = re.escape(response.url.split("/")[-2])
        match = re.search(
            f'{escaped_url}.+?"publicationDate":"(?P<date>\d{{4}}-\d{{2}}-\d{{2}}.+?)"',
            response.body_as_unicode(),
        )
        if match:
            date_str = match.group("date")
            last_updated = dateparser.parse(f"{date_str}")

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        text = article_data.text

        # last_updated
        escaped_url = re.escape(response.url.split("/")[-2])
        match = re.search(
            f'{escaped_url}.+?"publicationDate":"(?P<date>\d{{4}}-\d{{2}}-\d{{2}}.+?)"',
            response.body_as_unicode(),
        )
        if match:
            date_str = match.group("date")
            last_updated = dateparser.parse(f"{date_str}")

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
