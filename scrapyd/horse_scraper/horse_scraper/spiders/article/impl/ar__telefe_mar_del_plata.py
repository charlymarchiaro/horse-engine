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
        return "ar__telefe_mar_del_plata"

    def get_allowed_domains(self) -> List[str]:
        return ["mardelplata.telefe.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://mardelplata.telefe.com/",
            "https://mardelplata.telefe.com/local",
            "https://mardelplata.telefe.com/nacional",
            "https://mardelplata.telefe.com/redes",
            "https://mardelplata.telefe.com/horarios",
            "https://mardelplata.telefe.com/internacional",
            "https://mardelplata.telefe.com/saber-es-crecer",
            "https://mardelplata.telefe.com/espectaculos",
            "https://mardelplata.telefe.com/deportes",
            "https://mardelplata.telefe.com/especiales",
            "https://mardelplata.telefe.com/programacion",
            "https://mardelplata.telefe.com/institucionales",
        ]

    def get_url_filter(self) -> UrlFilter:
        allowed_categories = [
            "local",
            "nacional",
            "redes",
            "horarios",
            "internacional",
            "saber-es-crecer",
            "espectaculos",
            "deportes",
            "especiales",
            "programacion",
            "institucionales",
        ]
        allowed_categories_str = "|".join(allowed_categories)

        return UrlFilter(allow_re=[f".*({allowed_categories_str})\/.+\/"], deny_re=[])

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
