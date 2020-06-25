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
            concat_fn=lambda year, month, day: f"/{year}/{month}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "prensa_economica"

    def get_allowed_domains(self) -> List[str]:
        return ["prensaeconomica.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://prensaeconomica.com.ar/",
            "https://prensaeconomica.com.ar/economia/",
            "https://prensaeconomica.com.ar/economia/energia/",
            "https://prensaeconomica.com.ar/economia/finanzas/",
            "https://prensaeconomica.com.ar/empresas/",
            "https://prensaeconomica.com.ar/empresas/en-la-empresa-rrhh/",
            "https://prensaeconomica.com.ar/executive-life/",
            "https://prensaeconomica.com.ar/empresas/marketing/",
            "https://prensaeconomica.com.ar/empresas/mujer-ejecutiva/",
            "https://prensaeconomica.com.ar/empresas/pases/",
            "https://prensaeconomica.com.ar/internacionales/",
            "https://prensaeconomica.com.ar/negocios/comercio-exterior/",
            "https://prensaeconomica.com.ar/negocios/",
            "https://prensaeconomica.com.ar/negocios/agronegocios/",
            "https://prensaeconomica.com.ar/negocios/emprendedores/",
            "https://prensaeconomica.com.ar/negocios/exportaciones/",
            "https://prensaeconomica.com.ar/negocios/latinoamerica-negocios/",
            "https://prensaeconomica.com.ar/negocios/real-estate/",
            "https://prensaeconomica.com.ar/opiniones/",
            "https://prensaeconomica.com.ar/opiniones/columnas/",
            "https://prensaeconomica.com.ar/en-voz-baja/",
            "https://prensaeconomica.com.ar/empresas/hechos-protagonistas/",
            "https://prensaeconomica.com.ar/los-elegidos-del-editor/",
            "https://prensaeconomica.com.ar/politico/",
            "https://prensaeconomica.com.ar/noticias/",
            "https://prensaeconomica.com.ar/agenda/",
            "https://prensaeconomica.com.ar/agenda/200/",
            "https://prensaeconomica.com.ar/agenda/eventos/",
            "https://prensaeconomica.com.ar/noticias/entrevistas/",
            "https://prensaeconomica.com.ar/noticias/entrevistas/mano-a-mano/",
            "https://prensaeconomica.com.ar/sustentabilidad/",
            "https://prensaeconomica.com.ar/cultura_pop/",
            "https://prensaeconomica.com.ar/educacion/",
            "https://prensaeconomica.com.ar/noticias/foco/",
            "https://prensaeconomica.com.ar/noticias/perfil/",
            "https://prensaeconomica.com.ar/noticias/rankings-pe/",
            "https://prensaeconomica.com.ar/sobre-ruedas/",
            "https://prensaeconomica.com.ar/innovacion/",
            "https://prensaeconomica.com.ar/travel/",
            "https://prensaeconomica.com.ar/tech/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str}).+\/$"], deny_re=[])

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
        text = article_data.text

        # last_updated
        # date is not present anywhere in the article, getting year and month from URL
        # and adding estimated day number by the following rule:
        # day = current day number, if year/month equals current year/month
        # day = 01, otherwise

        match = re.search("\/(\d{4})\/(\d{2})\/", response.url)
        if match:
            year_str = match.group(1)
            month_str = match.group(2)

            today = datetime.today()
            current_year_str = str(today.year).zfill(4)
            current_month_str = str(today.month).zfill(2)
            current_day_str = str(today.day).zfill(2)

            if year_str == current_year_str and month_str == current_month_str:
                last_updated = dateparser.parse(
                    f"{year_str}/{month_str}/{current_day_str}"
                )
            else:
                last_updated = dateparser.parse(f"{year_str}/{month_str}/01")
        else:
            last_updated = None

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
