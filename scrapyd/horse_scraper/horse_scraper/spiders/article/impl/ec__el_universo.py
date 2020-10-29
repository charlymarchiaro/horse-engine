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
        return "ec__el_universo"

    def get_allowed_domains(self) -> List[str]:
        return ["eluniverso.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.eluniverso.com/",
            "https://www.eluniverso.com/noticias",
            "https://www.eluniverso.com/politica",
            "https://www.eluniverso.com/economia",
            "https://www.eluniverso.com/internacional",
            "https://www.eluniverso.com/ecuador",
            "https://www.eluniverso.com/intercultural",
            "https://www.eluniverso.com/seguridad",
            "https://www.eluniverso.com/ecologia",
            "https://www.eluniverso.com/informes",
            "https://www.eluniverso.com/opinion",
            "https://www.eluniverso.com/editoriales",
            "https://www.eluniverso.com/caricaturas",
            "https://www.eluniverso.com/columnistas",
            "https://www.eluniverso.com/cartas-al-director",
            "https://www.eluniverso.com/foro-de-lectores",
            "https://www.eluniverso.com/guayaquil",
            "https://www.eluniverso.com/comunidad",
            "https://www.eluniverso.com/obituarios",
            "https://www.eluniverso.com/viva",
            "https://www.eluniverso.com/samborondon",
            "https://www.eluniverso.com/urdesa-ceibos",
            "https://www.eluniverso.com/via-costa",
            "https://www.eluniverso.com/peninsula",
            "https://www.eluniverso.com/tema/quito",
            "https://www.eluniverso.com/deportes",
            "https://www.eluniverso.com/tablaposiciones",
            "https://www.eluniverso.com/tablaposiciones/partidos-del-dia",
            "https://www.eluniverso.com/futbol",
            "https://www.eluniverso.com/campeonato-ecuatoriano",
            "https://www.eluniverso.com/columnistas-deportes",
            "https://www.eluniverso.com/futbol-internacional",
            "https://www.eluniverso.com/ecuatorianos-exterior",
            "https://www.eluniverso.com/otros-deportes",
            "https://www.eluniverso.com/memorias-deportivas",
            "https://www.eluniverso.com/entretenimiento",
            "https://www.eluniverso.com/cine",
            "https://www.eluniverso.com/television",
            "https://www.eluniverso.com/videojuegos",
            "https://www.eluniverso.com/gastronomia",
            "https://www.eluniverso.com/cultura",
            "https://www.eluniverso.com/musica",
            "https://www.eluniverso.com/teatro",
            "https://www.eluniverso.com/gente",
            "https://www.eluniverso.com/redes-sociales",
            "https://www.eluniverso.com/turismo-local",
            "https://www.eluniverso.com/libros",
            "https://www.eluniverso.com/compras",
            "https://www.eluniverso.com/columnistas-vida",
            "https://www.eluniverso.com/motores",
            "https://www.eluniverso.com/larevista",
            "https://www.eluniverso.com/tecnologia",
            "https://www.eluniverso.com/cuerpo-alma",
            "https://www.eluniverso.com/columnistas-larevista",
            "https://www.eluniverso.com/el-especialista",
            "https://www.eluniverso.com/espectaculos",
            "https://www.eluniverso.com/orientacion",
            "https://www.eluniverso.com/sociedad",
            "https://www.eluniverso.com/moda",
            "https://www.eluniverso.com/diseno",
            "https://www.eluniverso.com/cocina",
            "https://www.eluniverso.com/salud",
            "https://www.eluniverso.com/destinos",
            "https://www.eluniverso.com/arte",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f".*({self.date_allow_str})nota\/\d+\/.*"], deny_re=[]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.eluniverso.com/googlenews.xml"]

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
