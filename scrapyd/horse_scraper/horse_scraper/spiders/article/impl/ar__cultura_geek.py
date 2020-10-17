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
        return "ar__cultura_geek"

    def get_allowed_domains(self) -> List[str]:
        return ["culturageek.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://culturageek.com.ar/",
            "https://culturageek.com.ar/category/tecnoticias/",
            "https://culturageek.com.ar/category/tecnoticias/ciencia/",
            "https://culturageek.com.ar/category/tecnoticias/games/",
            "https://culturageek.com.ar/category/tecnoticias/guia/",
            "https://culturageek.com.ar/category/tecnoticias/movil-tecnoticias/",
            "https://culturageek.com.ar/category/tecnoticias/tvcine/",
            "https://culturageek.com.ar/category/tecnoticias/gadgets-y-hardware/",
            "https://culturageek.com.ar/category/tecnoticias/social-tecnoticias/",
            "https://culturageek.com.ar/category/tecnoticias/sports/",
            "https://culturageek.com.ar/category/antitecno/",
            "https://culturageek.com.ar/category/programas-anteriores/",
            "https://culturageek.com.ar/category/entevistas/",
            "https://culturageek.com.ar/category/reviews-games-y-gadgets/",
            "https://culturageek.com.ar/category/reviews-games-y-gadgets/videojuegos/",
            "https://culturageek.com.ar/category/reviews-games-y-gadgets/smartphones/",
            "https://culturageek.com.ar/category/reviews-games-y-gadgets/gadgets-accesorios-y-tech/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*"],
            deny_re=[
                ".*culturageek.com.ar(\/.+\/.+\/).*",
                ".*culturageek.com.ar(\/(.){1,20}\/).*",
                ".*share=.*",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://culturageek.com.ar/sitemap_index.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return [".*post-sitemap.*"]

    def should_parse_sitemap_entry(self, entry: Any) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    def should_follow_article_url(self, url: str) -> bool:
        # Ignore if domain is only present in query
        return url.split("?")[0].find("culturageek.com.ar") != -1

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
