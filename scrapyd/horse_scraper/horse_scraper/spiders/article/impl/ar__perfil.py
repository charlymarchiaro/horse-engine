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
        # Enable Splash to parse dynamically loaded content
        self.splash_enabled = True
        self.splash_wait_time = 1
        # Override to ignore sitemap termination
        self.ignore_sitemap_termination = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ar__perfil"

    def get_allowed_domains(self) -> List[str]:
        return ["perfil.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.perfil.com/",
            "https://www.perfil.com/ultimo-momento",
            "https://www.perfil.com/seccion/50y50/",
            "https://www.perfil.com/seccion/actualidad",
            "https://www.perfil.com/seccion/actualidad/",
            "https://www.perfil.com/seccion/arte/",
            "https://www.perfil.com/seccion/bloomberg/",
            "https://www.perfil.com/seccion/ciencia/",
            "https://www.perfil.com/seccion/cordoba/",
            "https://www.perfil.com/seccion/coronavirus/",
            "https://www.perfil.com/seccion/cultura/",
            "https://www.perfil.com/seccion/deportes",
            "https://www.perfil.com/seccion/deportes/",
            "https://www.perfil.com/seccion/economia/",
            "https://www.perfil.com/seccion/educacion/",
            "https://www.perfil.com/seccion/empresas-y-protagonistas/",
            "https://www.perfil.com/seccion/equipo-de-investigacion/",
            "https://www.perfil.com/seccion/espectaculos/",
            "https://www.perfil.com/seccion/guia-de-abogados-pnt/",
            "https://www.perfil.com/seccion/guia-de-salud-pnt/",
            "https://www.perfil.com/seccion/igualdad/",
            "https://www.perfil.com/seccion/internacional/",
            "https://www.perfil.com/seccion/lollapalooza/",
            "https://www.perfil.com/seccion/mujer/",
            "https://www.perfil.com/seccion/noticias/",
            "https://www.perfil.com/seccion/opinion",
            "https://www.perfil.com/seccion/opinion/",
            "https://www.perfil.com/seccion/podcasts",
            "https://www.perfil.com/seccion/politica/",
            "https://www.perfil.com/seccion/protagonistas",
            "https://www.perfil.com/seccion/protagonistas/",
            "https://www.perfil.com/seccion/pymes/",
            "https://www.perfil.com/seccion/salud/",
            "https://www.perfil.com/seccion/sociedad/",
            "https://www.perfil.com/seccion/tecnologia/",
            "https://www.perfil.com/seccion/turismo/",
            "https://www.perfil.com/seccion/universidades/",
            "https://www.perfil.com/seccion/video/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*\/noticias\/.*.phtml"],
            deny_re=[
                ".*.phtml#.*",
                "caras.perfil.com\/{1,}caras.perfil.com"
                "exitoina.perfil.com\/{1,}exitoina.perfil.com"
                "parabrisas.perfil.com\/{1,}parabrisas.perfil.com"
                "weekend.perfil.com\/{1,}weekend.perfil.com"
                "www.perfil.com\/{1,}www.perfil.com",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.perfil.com/sitemap",
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
            self.parser_2,
            self.parser_3,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//section[contains(@class, "cuerpoNoticia")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relatedPost"),
                (AttributeType.CLASS, "destacadoNota"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # exitoina.perfil.com, hombre.perfil.com
    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "new-body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionada"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # radio.perfil.com
    def parser_3(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@id, "news-body")]',
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
