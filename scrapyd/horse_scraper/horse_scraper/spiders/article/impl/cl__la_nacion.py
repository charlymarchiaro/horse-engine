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
        return "cl__la_nacion"

    def get_allowed_domains(self) -> List[str]:
        return ["lanacion.cl"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://www.lanacion.cl/",
            "http://www.lanacion.cl/",
            "http://www.lanacion.cl/category/actualidad/",
            "http://www.lanacion.cl/category/internacional/",
            "http://www.lanacion.cl/category/nacional/",
            "http://www.lanacion.cl/category/politica/",
            "http://www.lanacion.cl/category/opinion/",
            "http://www.lanacion.cl/category/columnistas/",
            "http://www.lanacion.cl/category/entrevistas/",
            "http://www.lanacion.cl/category/economia/",
            "http://www.lanacion.cl/category/emprendimiento/",
            "http://triunfo.lanacion.cl",
            "http://www.lanacion.cl/category/mujer/",
            "http://www.lanacion.cl/category/moda/",
            "http://www.lanacion.cl/category/belleza/",
            "http://www.lanacion.cl/category/vanguardia/",
            "http://www.lanacion.cl/category/cultura/",
            "http://www.lanacion.cl/category/panoramas/",
            "http://www.lanacion.cl/category/nacion-indiscreta/",
            "http://www.lanacion.cl/category/espectaculos/",
            "http://www.lanacion.cl/category/tendencia/",
            "http://www.lanacion.cl/category/ciencia/",
            "http://www.lanacion.cl/category/tecnologia/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["www.lanacion.cl\/.{10,}\/$"],
            deny_re=[
                "www.lanacion.cl\/.+\/.+\/.+",
                ".*\/page\/\d+.*",
                ".*\/category\/.*",
                ".*\/tag\/.*",
                ".*\?.*",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["http://www.lanacion.cl/sitemap_index.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return ["post-sitemap"]

    def should_parse_sitemap_entry(self, entry: Any) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    def should_follow_article_url(self, url: str) -> bool:
        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            # self.parser_1,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div [@class="newsfull__content"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionadas"),
            ],
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
