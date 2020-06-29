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
        return "gerencia_ambiental"

    def get_allowed_domains(self) -> List[str]:
        return ["gerencia-ambiental.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://gerencia-ambiental.com/",
            "https://gerencia-ambiental.com/category/2020/",
            "https://gerencia-ambiental.com/category/leg-arg/",
            "https://gerencia-ambiental.com/category/agenda/",
            "https://gerencia-ambiental.com/category/busquedas-laborales/",
            "https://gerencia-ambiental.com/category/capacitacion-ga/",
            "https://gerencia-ambiental.com/category/encuesta/",
            "https://gerencia-ambiental.com/category/gerentes-sustentabilidad/",
            "https://gerencia-ambiental.com/category/identikit/",
            "https://gerencia-ambiental.com/category/itec/",
            "https://gerencia-ambiental.com/category/nota-destacada/",
            "https://gerencia-ambiental.com/category/novedades/",
            "https://gerencia-ambiental.com/category/novedades-legislativas/",
            "https://gerencia-ambiental.com/category/oportunidades-laborales/",
            "https://gerencia-ambiental.com/category/psus/",
            "https://gerencia-ambiental.com/category/rse/",
            "https://gerencia-ambiental.com/category/rep/",
            "https://gerencia-ambiental.com/category/revistas-ga-2020/",
            "https://gerencia-ambiental.com/category/sin-categoria/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*gerencia-ambiental.com\/.{10,}\/$"],
            deny_re=[".*gerencia-ambiental.com\/.+\/.+\/.*"],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://gerencia-ambiental.com/sitemap_index.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return [".*post-sitemap.*"]

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
