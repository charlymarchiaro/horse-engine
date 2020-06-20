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
        return "revista_petroquimica"

    def get_allowed_domains(self) -> List[str]:
        return ["revistapetroquimica.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.revistapetroquimica.com/",
            "https://www.revistapetroquimica.com/secciones/petroleo/",
            "https://www.revistapetroquimica.com/secciones/energia/",
            "https://www.revistapetroquimica.com/secciones/gas/",
            "https://www.revistapetroquimica.com/secciones/petroquimica/",
            "https://www.revistapetroquimica.com/secciones/shale/",
            "https://www.revistapetroquimica.com/secciones/combustibles/",
            "https://www.revistapetroquimica.com/secciones/energias-renovables/",
            "https://www.revistapetroquimica.com/secciones/medio-ambiente/",
            "https://www.revistapetroquimica.com/secciones/quimica/",
            "https://www.revistapetroquimica.com/secciones/economia/",
            "https://www.revistapetroquimica.com/secciones/logistica/",
            "https://www.revistapetroquimica.com/secciones/empresas-negocios/",
            "https://www.revistapetroquimica.com/secciones/internacionales/",
            "https://www.revistapetroquimica.com/secciones/entrevistas-exclusivas/",
            "https://www.revistapetroquimica.com/secciones/tecnologia-y-negocios/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*revistapetroquimica.com\/.{20,}\/$"],
            deny_re=[".*revistapetroquimica.com\/.+\/.+\/.*"],
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