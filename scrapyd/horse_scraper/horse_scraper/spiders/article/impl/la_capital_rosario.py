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
        return "la_capital_rosario"

    def get_allowed_domains(self) -> List[str]:
        return ["lacapital.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lacapital.com.ar/",
            "https://www.lacapital.com.ar/secciones/policiales.html",
            "https://www.lacapital.com.ar/secciones/laciudad.html",
            "https://www.lacapital.com.ar/secciones/laregion.html",
            "https://www.lacapital.com.ar/secciones/agroclave.html",
            "https://www.lacapital.com.ar/secciones/opinion.html",
            "https://www.lacapital.com.ar/secciones/politica.html",
            "https://www.lacapital.com.ar/secciones/elmundo.html",
            "https://www.lacapital.com.ar/secciones/informaciongral.html",
            "https://www.lacapital.com.ar/secciones/economia.html",
            "https://www.lacapital.com.ar/secciones/envozbaja.html",
            "https://www.lacapital.com.ar/secciones/paginasolidaria.html",
            "https://www.lacapital.com.ar/secciones/ovacion.html",
            "https://www.lacapital.com.ar/secciones/escenario.html",
            "https://www.lacapital.com.ar/secciones/edicion_impresa.html",
            "https://www.lacapital.com.ar/secciones/mas.html",
            "https://www.lacapital.com.ar/secciones/agroclave.html",
            "https://www.lacapital.com.ar/secciones/economia.html",
            "https://www.lacapital.com.ar/secciones/turismo.html",
            "https://www.lacapital.com.ar/secciones/educacion.html",
            "https://www.lacapital.com.ar/secciones/cultura_y_libros.html",
            "https://www.lacapital.com.ar/secciones/diversos.html",
            "https://www.lacapital.com.ar/secciones/agropecuario.html",
            "https://www.lacapital.com.ar/secciones/trabajo.html",
            "https://www.lacapital.com.ar/secciones/legales.html",
            "https://www.lacapital.com.ar/secciones/ultimo-momento.html",
            "https://www.lacapital.com.ar/secciones/resultado.html",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*-n\d{6,}.html"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.lacapital.com.ar/sitemap.xml"]

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
        text = article_data.text

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='//p[contains(@class, "paragraph-date")]',
                exclude_list=[],
            ).split("-")[-1]
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
