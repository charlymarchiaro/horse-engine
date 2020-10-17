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
        # Keep article url query string
        self.keep_url_query_string = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ar__planeta_joy"

    def get_allowed_domains(self) -> List[str]:
        return ["planetajoy.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.planetajoy.com/",
            "https://www.planetajoy.com/?page=Comer::Mejores_restaurantes_para..",
            "https://www.planetajoy.com/?page=Comer::Nuevos_restaurantes",
            "https://www.planetajoy.com/?page=Comer::Solo_para_golosos",
            "https://www.planetajoy.com/?page=Comer::En_la_gondola",
            "https://www.planetajoy.com/?page=Comer::Recetas_para_gente_que_no_sabe_cocinar",
            "https://www.planetajoy.com/?page=Comer::El_dato_util_de_la_semana",
            "https://www.planetajoy.com/?page=Beber::Mejores_vinos_para...",
            "https://www.planetajoy.com/?page=Beber::Nuevos_vinos",
            "https://www.planetajoy.com/?page=Beber::Novedades_para_calentar_el_pico",
            "https://www.planetajoy.com/?page=Beber::Solo_para_abstemios",
            "https://www.planetajoy.com/?page=Beber::Bares_y_barras",
            "https://www.planetajoy.com/?page=Beber::Cocteles_para_preparar_en_1_minuto",
            "https://www.planetajoy.com/?page=Style::Moda",
            "https://www.planetajoy.com/?page=Style::Las_chicas_mas_lindas_de_JOY",
            "https://www.planetajoy.com/?page=Style::Envidia",
            "https://www.planetajoy.com/?page=Inutilisima::Notas_para_leer_en_el_bano",
            "https://www.planetajoy.com/?page=Inutilisima::Todo_mal",
            "https://www.planetajoy.com/?page=Inutilisima::Planeta_bizarro",
            "https://www.planetajoy.com/?page=Inutilisima::Informacion_que_no_sirve_para_nada",
            "https://www.planetajoy.com/?page=Inutilisima::Antifashion",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*\?.*id=\d{4,}"], deny_re=[".*&url=.*"])

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
        # Ignore if domain is only present in query
        return url.split("?")[0].find("planetajoy.com") != -1

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='//div[contains(@class, "datos")]',
                exclude_list=[],
            ),
            settings={"DATE_ORDER": "DMY"},
        )

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "noticia")]//div[contains(@class, "nota")]',
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
