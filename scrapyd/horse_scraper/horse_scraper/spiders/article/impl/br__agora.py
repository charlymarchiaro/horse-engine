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
        self.date_allow_str = self.get_date_allow_str(
            year_format="04",
            month_format="02",
            day_format="02",
            concat_fn=lambda year, month, day: f"/{year}/{month}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "br__agora"

    def get_allowed_domains(self) -> List[str]:
        return ["agora.folha.uol.com.br"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://agora.folha.uol.com.br/",
            "https://agora.folha.uol.com.br/ultimas-noticias/",
            "https://agora.folha.uol.com.br/grana/",
            "https://agora.folha.uol.com.br/grana/inss/",
            "https://agora.folha.uol.com.br/sao-paulo/",
            "https://agora.folha.uol.com.br/zapping/",
            "https://agora.folha.uol.com.br/ola/",
            "https://agora.folha.uol.com.br/esporte/",
            "https://agora.folha.uol.com.br/maquina/",
            "https://agora.folha.uol.com.br/falecomoagora/index.shtml",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f"agora.folha.uol.com.br\/.+({self.date_allow_str}).+.shtml"],
            deny_re=[],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://agora.folha.uol.com.br/sitemap.xml"]

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
        return []


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
