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
            concat_fn=lambda year, month, day: f"/{year}/{month}/{day}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ar__unirse"

    def get_allowed_domains(self) -> List[str]:
        return ["unirse.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://www.unirse.com.ar/",
            "http://www.unirse.com.ar/innovacion/",
            "http://www.unirse.com.ar/medios/",
            "http://www.unirse.com.ar/pobreza/",
            "http://www.unirse.com.ar/sociedad/",
            "http://www.unirse.com.ar/agenda/",
            "http://www.unirse.com.ar/arte-y-sustentabilidad/",
            "http://www.unirse.com.ar/cadena-de-valor/",
            "http://www.unirse.com.ar/cadena-de-valor/clientes/",
            "http://www.unirse.com.ar/cadena-de-valor/empleados/",
            "http://www.unirse.com.ar/cadena-de-valor/proveedores/",
            "http://www.unirse.com.ar/cadena-de-valor/pymes-cadena-de-valor/",
            "http://www.unirse.com.ar/entrevistas/",
            "http://www.unirse.com.ar/entrevistas/comentarios-radio/",
            "http://www.unirse.com.ar/entrevistas/unirse-radio/",
            "http://www.unirse.com.ar/entrevistas/unirse-radio/especiales-covid19/",
            "http://www.unirse.com.ar/entrevistas/unirse-radio/movimiento-responsable-unirse-radio-entrevistas/",
            "http://www.unirse.com.ar/entrevistas/unirse-tv-entrevistas/",
            "http://www.unirse.com.ar/entrevistas/video-entrevistas/",
            "http://www.unirse.com.ar/genero/",
            "http://www.unirse.com.ar/inversion/",
            "http://www.unirse.com.ar/inversion/concurso-de-proyectos/",
            "http://www.unirse.com.ar/inversion/cultura/",
            "http://www.unirse.com.ar/inversion/educacion/",
            "http://www.unirse.com.ar/inversion/inclusion/",
            "http://www.unirse.com.ar/inversion/marketing-con-causa/",
            "http://www.unirse.com.ar/inversion/prevencion-inversion/",
            "http://www.unirse.com.ar/inversion/salud/",
            "http://www.unirse.com.ar/inversion/solidaridad/",
            "http://www.unirse.com.ar/inversion/voluntariado-inversion/",
            "http://www.unirse.com.ar/medio-ambiente/",
            "http://www.unirse.com.ar/medio-ambiente/campanas-medio-ambiente/",
            "http://www.unirse.com.ar/medio-ambiente/programasma/",
            "http://www.unirse.com.ar/noticias/",
            "http://www.unirse.com.ar/noticias/covid19/",
            "http://www.unirse.com.ar/noticias/management/",
            "http://www.unirse.com.ar/noticias/noticias-de-tapa/",
            "http://www.unirse.com.ar/noticias/ultimas-noticias/",
            "http://www.unirse.com.ar/nutricion-responsable/",
            "http://www.unirse.com.ar/nutricion-responsable/especiales-cuarentena/",
            "http://www.unirse.com.ar/ods/",
            "http://www.unirse.com.ar/ong/",
            "http://www.unirse.com.ar/opinion/",
            "http://www.unirse.com.ar/reportes/",
            "http://www.unirse.com.ar/turismo-sustentable/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str}).+\/"], deny_re=[])

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
            root_xpath='//div[@id="content"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.ID, "respond"),
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
