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
        # Keep article url query string
        self.keep_url_query_string = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ar__revista_habitat"

    def get_allowed_domains(self) -> List[str]:
        return ["revistahabitat.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://revistahabitat.com/",
            "http://revistahabitat.com/?page_id=8",
            "http://revistahabitat.com/?page_id=9",
            "http://revistahabitat.com/?page_id=10",
            "http://revistahabitat.com/?page_id=11",
            "http://revistahabitat.com/?page_id=13",
            "http://revistahabitat.com/?page_id=141",
            "http://revistahabitat.com/?page_id=143",
            "http://revistahabitat.com/?page_id=145",
            "http://revistahabitat.com/?page_id=146",
            "http://revistahabitat.com/?page_id=149",
            "http://revistahabitat.com/?page_id=150",
            "http://revistahabitat.com/?page_id=151",
            "http://revistahabitat.com/?page_id=1098",
            "http://revistahabitat.com/?page_id=2761",
            "http://revistahabitat.com/?page_id=2847",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*revistahabitat.com\/\?p=\d{3,}$"], deny_re=[])

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
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        text = article_data.text

        match = re.search("p=(\d+)", response.url)
        if match:
            post_id = str(match.group(1))

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath=f'(//article[contains(@class, "{post_id}")])[1]//*[contains(@class, "post-date")]',
                exclude_list=[],
            )
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
