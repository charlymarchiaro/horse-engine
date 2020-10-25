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
        return "co__portafolio"

    def get_allowed_domains(self) -> List[str]:
        return ["portafolio.co"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.portafolio.co/",
            "https://www.portafolio.co/economia",
            "https://www.portafolio.co/economia/finanzas",
            "https://www.portafolio.co/economia/gobierno",
            "https://www.portafolio.co/economia/infraestructura",
            "https://www.portafolio.co/economia/empleo",
            "https://www.portafolio.co/economia/impuestos",
            "https://www.portafolio.co/negocios",
            "https://www.portafolio.co/negocios/empresas",
            "https://www.portafolio.co/negocios/emprendimiento",
            "https://www.portafolio.co/ttps://empresas.portafolio.co",
            "https://www.portafolio.co/negocios/inversion",
            "https://www.portafolio.co/internacional",
            "https://www.portafolio.co/innovacion",
            "https://www.portafolio.co/indicadores-economicos",
            "https://www.portafolio.co/indicadores-economicos/acciones",
            "https://www.portafolio.co/mis-finanzas",
            "https://www.portafolio.co/mis-finanzas/ahorro",
            "https://www.portafolio.co/mis-finanzas/vivienda",
            "https://www.portafolio.co/mis-finanzas/jubilacion",
            "https://www.portafolio.co/opinion",
            "https://www.portafolio.co/opinion/editorial",
            "https://www.portafolio.co/tendencias",
            "https://www.portafolio.co/tendencias/entretenimiento",
            "https://www.portafolio.co/tendencias/sociales",
            "https://www.portafolio.co/tendencias/lujo",
            "https://www.portafolio.co/revista-portafolio",
            "https://www.portafolio.co/foros",
            "https://www.portafolio.co/premios",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=["www.portafolio.co\/.+-\d{5,}$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.portafolio.co/sitemap-index.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return ["sitemap-articles"]

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
            root_xpath='//section[contains(@class, "article-container")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.TARGET, "_blank"),
                (AttributeType.CLASS, "actions-wrapper"),
                (AttributeType.CLASS, "recomendados"),
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
