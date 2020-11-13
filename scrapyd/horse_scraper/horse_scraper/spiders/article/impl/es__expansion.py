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
        return "es__expansion"

    def get_allowed_domains(self) -> List[str]:
        return ["expansion.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.expansion.com/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f"expansion.com\/.+({self.date_allow_str}).+.html"], deny_re=[]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.expansion.com/mercados.html",
            "https://www.expansion.com/mercados/cotizaciones/indices/ibex35_I.IB.html",
            "https://www.expansion.com/mercados/cotizaciones/indices/igbolsamadrid_I.MA.html",
            "https://www.expansion.com/mercados/indices.html",
            "https://www.expansion.com/mercados/euribor.html",
            "https://www.expansion.com/mercados/renta-fija.html",
            "https://www.expansion.com/mercados/divisas.html",
            "https://www.expansion.com/mercados/recomendaciones.html",
            "https://www.expansion.com/mercados/fondos.html",
            "https://www.expansion.com/mercados/cronica-bolsa.html",
            "https://www.expansion.com/mercados/materias-primas.html",
            "https://www.expansion.com/ahorro/pensiones.html",
            "https://www.expansion.com/mercados/dividendos.html",
            "https://www.expansion.com/mercados/warrants.html",
            "https://www.expansion.com/mercados/mab.html",
            "https://www.expansion.com/mercados/principales-criptomonedas.html",
            "https://www.expansion.com/ahorro.html",
            "https://www.expansion.com/diccionario-economico.html",
            "https://www.expansion.com/ed/tudinero.html",
            "https://www.expansion.com/empresas.html",
            "https://www.expansion.com/empresas/banca.html",
            "https://www.expansion.com/empresas/energia.html",
            "https://www.expansion.com/empresas/tecnologia.html",
            "https://www.expansion.com/empresas/inmobiliario.html",
            "https://www.expansion.com/empresas/distribucion.html",
            "https://www.expansion.com/empresas/transporte.html",
            "https://www.expansion.com/empresas/industria.html",
            "https://www.expansion.com/empresas/motor.html",
            "https://www.expansion.com/economia.html",
            "https://www.expansion.com/economia/politica.html",
            "https://www.expansion.com/economia/funcion-publica.html",
            "https://www.expansion.com/economia/declaracion-renta.html",
            "https://www.expansion.com/economia-para-todos/index.html",
            "https://www.expansion.com/expansion-empleo.html",
            "https://www.expansion.com/expansion-empleo/emprendedores.html",
            "https://www.expansion.com/expansion-empleo/empleo.html",
            "https://www.expansion.com/expansion-empleo/profesiones.html",
            "https://www.expansion.com/expansion-empleo/desarrollo-carrera.html",
            "https://www.expansion.com/expansion-empleo/empleatv.html",
            "https://www.expansion.com/pymes.html",
            "https://www.expansion.com/juridico.html",
            "https://www.expansion.com/juridico/actualidad-tendencias.html",
            "https://www.expansion.com/juridico/fichajes.html",
            "https://www.expansion.com/juridico/sentencias.html",
            "https://www.expansion.com/juridico/opinion.html",
            "https://www.expansion.com/juridico/premios.html",
            "https://www.expansion.com/juridico/aula-legal.html",
            "https://www.expansion.com/tecnologia.html",
            "https://www.expansion.com/directivos.html",
            "https://www.expansion.com/directivos/estilo-vida.html",
            "https://www.expansion.com/directivos/deporte-negocio.html",
            "https://www.expansion.com/sociedad.html",
            "https://www.expansion.com/economia-digital.html",
            "https://www.expansion.com/economia-digital/companias.html",
            "https://www.expansion.com/economia-digital/protagonistas.html",
            "https://www.expansion.com/economia-digital/innovacion.html",
        ]

    def get_rss_urls(self) -> List[str]:
        return [
            "https://e00-expansion.uecdn.es/rss/portada.xml",
            "https://e00-expansion.uecdn.es/rss/mercados.xml",
            "https://e00-expansion.uecdn.es/rss/mercadoseuribor.xml",
            "https://e00-expansion.uecdn.es/rss/mercadosrentafija.xml",
            "https://e00-expansion.uecdn.es/rss/midinero.xml",
            "https://e00-expansion.uecdn.es/rss/empresas.xml",
            "https://e00-expansion.uecdn.es/rss/empresasbanca.xml",
            "https://e00-expansion.uecdn.es/rss/empresastmt.xml",
            "https://e00-expansion.uecdn.es/rss/empresasenergia.xml",
            "https://e00-expansion.uecdn.es/rss/empresasinmobiliario.xml",
            "https://e00-expansion.uecdn.es/rss/empresastransporte.xml",
            "https://e00-expansion.uecdn.es/rss/empresasauto-industria.xml",
            "https://e00-expansion.uecdn.es/rss/empresasdistribucion.xml",
            "https://e00-expansion.uecdn.es/rss/empresasdeporte.xml",
            "https://e00-expansion.uecdn.es/rss/empresasdigitech.xml",
            "https://e00-expansion.uecdn.es/rss/empresasmotor.xml",
            "https://e00-expansion.uecdn.es/rss/economiapolitica.xml",
            "https://e00-expansion.uecdn.es/rss/economia.xml",
            "https://e00-expansion.uecdn.es/rss/entorno.xml",
            "https://e00-expansion.uecdn.es/rss/opinion.xml",
            "https://e00-expansion.uecdn.es/rss/juridico.xml",
            "https://e00-expansion.uecdn.es/rss/juridicoopinion.xml",
            "https://e00-expansion.uecdn.es/rss/juridicosentencias.xml",
            "https://e00-expansion.uecdn.es/rss/emprendedores-empleo.xml",
            "https://e00-expansion.uecdn.es/rss/emprendedores-empleoemprendimiento.xml",
            "https://e00-expansion.uecdn.es/rss/emprendedores-empleomercado-laboral.xml",
            "https://e00-expansion.uecdn.es/rss/emprendedores-empleodesarrollo-de-carrera.xml",
            "https://e00-expansion.uecdn.es/rss/emprendedores-empleoopinion.xml",
            "https://e00-expansion.uecdn.es/rss/emprendedores-empleoempleatv.xml",
            "https://e00-expansion.uecdn.es/rss/catalunya.xml",
            "https://e00-expansion.uecdn.es/rss/funcion-publica.xml",
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
            root_xpath='//div [contains(@class, "article__body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "related"),
                (AttributeType.CLASS, "comentarios"),
                (AttributeType.CLASS, "article__secondary"),
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
