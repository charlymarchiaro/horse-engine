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
        return "mx__forbes_mex"

    def get_allowed_domains(self) -> List[str]:
        return ["forbes.com.mx"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.forbes.com.mx/",
            "https://www.forbes.com.mx/ultimas-noticias/",
            "https://www.forbes.com.mx/actualidad/",
            "https://www.forbes.com.mx/forbes-politica/",
            "https://www.forbes.com.mx/economia-y-finanzas/",
            "https://www.forbes.com.mx/negocios/",
            "https://www.forbes.com.mx/tecnologia/",
            "https://www.forbes.com.mx/capital-humano-2/",
            "https://www.forbes.com.mx/country-branding/",
            "https://www.forbes.com.mx/red-forbes/",
            "https://www.forbes.com.mx/forbes-life/all-access/",
            "https://www.forbes.com.mx/forbes-life/arte-y-cultura/",
            "https://www.forbes.com.mx/forbes-life/deportes/",
            "https://www.forbes.com.mx/forbes-life/diseno-y-arquitectura/",
            "https://www.forbes.com.mx/forbes-life/estilo-forbes-life/",
            "https://www.forbes.com.mx/forbes-life/filantropia-forbes-life/",
            "https://www.forbes.com.mx/forbes-life/gourmet-forbes-life/",
            "https://www.forbes.com.mx/forbes-life/hogar/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[
                "www.forbes.com.mx\/.{20,}\/$",
                "www.forbes.com.mx\/forbes-life\/.{20,}\/$",
            ],
            deny_re=["www.forbes.com.mx.*\/(?!forbes-life)\/.+\/.*", ".*\/tag\/.*",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.forbes.com.mx/sitemap_index.xml",
            "https://www.forbes.com.mx/news-sitemap.xml",
        ]

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
