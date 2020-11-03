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
            concat_fn=lambda year, month, day: f"/{year}{month}{day}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "bo__los_tiempos"

    def get_allowed_domains(self) -> List[str]:
        return ["lostiempos.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lostiempos.com/",
            "https://www.lostiempos.com/ultimas-noticias",
            "https://www.lostiempos.com/actualidad",
            "https://www.lostiempos.com/actualidad/pais",
            "https://www.lostiempos.com/actualidad/mundo",
            "https://www.lostiempos.com/actualidad/economia",
            "https://www.lostiempos.com/actualidad/cochabamba",
            "https://www.lostiempos.com/actualidad/opinion",
            "https://www.lostiempos.com/lt-data",
            "https://www.lostiempos.com/deportes",
            "https://www.lostiempos.com/deportes/entretiempo",
            "https://www.lostiempos.com/deportes/futbol",
            "https://www.lostiempos.com/deportes/futbol-int",
            "https://www.lostiempos.com/deportes/motores",
            "https://www.lostiempos.com/deportes/multideportivo",
            "https://www.lostiempos.com/deportes/tenis",
            "https://www.lostiempos.com/tendencias",
            "https://www.lostiempos.com/tendencias/interesante",
            "https://www.lostiempos.com/tendencias/bienestar",
            "https://www.lostiempos.com/tendencias/casa",
            "https://www.lostiempos.com/tendencias/ciencia",
            "https://www.lostiempos.com/tendencias/cocina",
            "https://www.lostiempos.com/tendencias/educacion",
            "https://www.lostiempos.com/tendencias/salud",
            "https://www.lostiempos.com/tendencias/medio-ambiente",
            "https://www.lostiempos.com/tendencias/sexualidad",
            "https://www.lostiempos.com/tendencias/tecnologia",
            "https://www.lostiempos.com/tendencias/viral",
            "https://www.lostiempos.com/doble-click",
            "https://www.lostiempos.com/doble-click/cultura",
            "https://www.lostiempos.com/doble-click/cine",
            "https://www.lostiempos.com/doble-click/conectados",
            "https://www.lostiempos.com/doble-click/espectaculos",
            "https://www.lostiempos.com/doble-click/farandula",
            "https://www.lostiempos.com/doble-click/humor",
            "https://www.lostiempos.com/doble-click/invitados",
            "https://www.lostiempos.com/doble-click/moda",
            "https://www.lostiempos.com/doble-click/musica",
            "https://www.lostiempos.com/doble-click/sociales",
            "https://www.lostiempos.com/doble-click/tv",
            "https://www.lostiempos.com/doble-click/vida",
            "https://www.lostiempos.com/oh",
            "https://www.lostiempos.com/oh/paparazzi",
            "https://www.lostiempos.com/oh/tendencias",
            "https://www.lostiempos.com/oh/decimos-oh",
            "https://www.lostiempos.com/oh/entrevista",
            "https://www.lostiempos.com/oh/columnas",
            "https://www.lostiempos.com/oh/actualidad",
            "https://www.lostiempos.com/suplementos-impresos/lecturas",
            "https://www.lostiempos.com/servicios/necrologicos",
            "https://www.lostiempos.com/mostrador",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f"({self.date_allow_str})"], deny_re=[])

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
        return [
            self.parser_1,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
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
