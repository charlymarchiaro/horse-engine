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
        return "tercer_sector"

    def get_allowed_domains(self) -> List[str]:
        return ["tercersector.org.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://tercersector.org.ar/",
            "https://tercersector.org.ar/category/accion-ante-la-pandemia/",
            "https://tercersector.org.ar/category/adolescencia/",
            "https://tercersector.org.ar/category/cooperativismo/",
            "https://tercersector.org.ar/category/cultura/",
            "https://tercersector.org.ar/category/economia-social/",
            "https://tercersector.org.ar/category/educacion/",
            "https://tercersector.org.ar/category/entrevistas/",
            "https://tercersector.org.ar/category/genero/",
            "https://tercersector.org.ar/category/inclusion-social/",
            "https://tercersector.org.ar/category/informe-especial/",
            "https://tercersector.org.ar/category/innovacion/",
            "https://tercersector.org.ar/category/internacionales/",
            "https://tercersector.org.ar/category/medio-ambiente/",
            "https://tercersector.org.ar/category/medios/",
            "https://tercersector.org.ar/category/ninez/",
            "https://tercersector.org.ar/category/participacion-ciudadana/",
            "https://tercersector.org.ar/category/pobreza/",
            "https://tercersector.org.ar/category/pueblos-originarios/",
            "https://tercersector.org.ar/category/rse/",
            "https://tercersector.org.ar/category/salud/",
            "https://tercersector.org.ar/category/sociedad/",
            "https://tercersector.org.ar/category/vida-sustentable/",
            "https://tercersector.org.ar/category/voluntariado/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["tercersector.org.ar\/.{10,}"],
            deny_re=["tercersector.org.ar\/.+\/.+\/.*"],
        )

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
        return []


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
