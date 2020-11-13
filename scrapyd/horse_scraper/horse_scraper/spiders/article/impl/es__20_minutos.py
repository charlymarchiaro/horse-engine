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
            concat_fn=lambda year, month, day: f"{year}{month}{day}",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "es__20_minutos"

    def get_allowed_domains(self) -> List[str]:
        return ["20minutos.es"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.20minutos.es/",
            "https://www.20minutos.es/nacional/",
            "https://www.20minutos.es/internacional/",
            "https://www.20minutos.es/deportes/",
            "https://www.20minutos.es/opinion/",
            "https://www.20minutos.es/gente/",
            "https://www.20minutos.es/television/",
            "https://www.20minutos.es/economia/",
            "https://www.20minutos.es/andalucia/",
            "https://www.20minutos.es/cataluna/",
            "https://www.20minutos.es/madrid/",
            "https://www.20minutos.es/comunidad-valenciana/",
            "https://www.20minutos.es/nacional/",
            "https://www.20minutos.es/internacional/",
            "https://www.20minutos.es/deportes/",
            "https://www.20minutos.es/cultura/",
            "https://www.20minutos.es/opinion/",
            "https://www.20minutos.es/gente/",
            "https://www.20minutos.es/television/",
            "https://www.20minutos.es/economia/",
            "https://www.20minutos.es/ciudades/",
            "https://www.20minutos.es/ciencia/",
            "https://www.20minutos.es/salud/",
            "https://www.20minutos.es/viajes/",
            "https://www.20minutos.es/motor/",
            "https://www.20minutos.es/medio-ambiente/",
            "https://www.20minutos.es/vivienda/",
            "https://www.20minutos.es/empleo/",
            "https://www.20minutos.es/tecnologia/",
            "https://www.20minutos.es/videojuegos/",
            "https://www.20minutos.es/gonzoo/",
            "https://www.20minutos.es/gastronomia/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[
                "\/noticia\/\d{5,}\/",
                "\/noticias\/.+-d{5,}\/",
                f"\/opinion\/.+-{self.date_allow_str}",
            ],
            deny_re=[],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.20minutos.es/sitemap-index.xml",
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
            root_xpath='//div[contains(@class,"article-text")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "media-integrated"),
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
