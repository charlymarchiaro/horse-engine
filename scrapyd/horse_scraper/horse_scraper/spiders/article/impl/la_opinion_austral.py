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
        pass

    # Common params
    def _get_spider_base_name(self) -> str:
        return "la_opinion_austral"

    def get_allowed_domains(self) -> List[str]:
        return ["laopinionaustral.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://laopinionaustral.com.ar/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*-\d{6}\d*.html"],
            deny_re=[
                "laopinionaustral.com.ar\/amp\/.*",
                "laopinionaustral.com.ar.*\/\/.*",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://laopinionaustral.com.ar/sitemaps/sitemap-index.xml",
            "https://laopinionaustral.com.ar/sitemaps/sitemap-googlenews.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [".*"]

    def should_parse_sitemap_entry(self, entry: Any) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    def should_follow_article_url(self, url: str) -> bool:
        # Greater than 16xxxx corresponds to Feb 2020 or later
        # (This applies to .txt sitemap without entry dates)
        s = re.search(".*-(\d{6,}).html", url)
        if s and int(s.group(1)) < 160000:
            return False
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
        if not text:
            text = "Nota sin texto"
        last_updated = article_data.last_updated

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
