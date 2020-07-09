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
        # Enable Selenium to parse dynamically loaded content
        self.selenium_enabled = True
        self.selenium_wait_time = 0.5

    # Common params
    def _get_spider_base_name(self) -> str:
        return "gaceta_mercantil"

    def get_allowed_domains(self) -> List[str]:
        return ["gacetamercantil.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.gacetamercantil.com/",
            "https://www.gacetamercantil.com/campo/",
            "https://www.gacetamercantil.com/turismo/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*\/notas\/\d{5,}\/.+.html"], deny_re=[])

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

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@ng-bind-html, "nota.cuerpo")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.NG_BIND, "relacionada"),
            ],
        )

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='(//div[contains(@class,"fecha_nota")])[1]',
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
