from typing import Tuple, List, Dict, Any, Union, Callable, cast

import time

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
from horse_scraper.settings import DOWNLOAD_DELAY
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
        self.date_allow_str = self.get_date_allow_str(
            year_format="04",
            month_format="02",
            day_format="02",
            concat_fn=lambda year, month, day: f"/{year}/{month}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "br__folha_de_san_pablo"

    def get_allowed_domains(self) -> List[str]:
        return ["folha.uol.com.br"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.folha.uol.com.br/",
            "https://www1.folha.uol.com.br/ultimas-noticias",
            "https://www1.folha.uol.com.br/opiniao",
            "https://www1.folha.uol.com.br/poder/",
            "https://www1.folha.uol.com.br/mercado",
            "https://www1.folha.uol.com.br/mundo",
            "https://www1.folha.uol.com.br/cotidiano",
            "https://www1.folha.uol.com.br/esporte/",
            "https://www1.folha.uol.com.br/ilustrada",
            "https://www1.folha.uol.com.br/podcasts/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f"folha.uol.com.br\/.+({self.date_allow_str}).+.shtml"],
            deny_re=[],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www1.folha.uol.com.br/folha-online-sitemap.xml"]

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
        # For some reason, this spider does not respect the download delay --> using time.sleep
        time.sleep(DOWNLOAD_DELAY)

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated
        text = article_data.text

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
