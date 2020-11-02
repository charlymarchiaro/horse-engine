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
        # Enable Splash to parse dynamically loaded content
        self.splash_enabled = True
        self.splash_wait_time = 5

    # Common params
    def _get_spider_base_name(self) -> str:
        return "mx__publimetro"

    def get_allowed_domains(self) -> List[str]:
        return ["publimetro.com.mx"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.publimetro.com.mx/mx/",
            "https://www.publimetro.com.mx/mx/noticias/",
            "https://www.publimetro.com.mx/mx/ciudad/",
            "https://www.publimetro.com.mx/mx/economia/",
            "https://www.publimetro.com.mx/mx/mundo/",
            "https://www.publimetro.com.mx/mx/estados/",
            "https://www.publimetro.com.mx/mx/coronavirus-covid-19/",
            "https://www.publimetro.com.mx/mx/publisport/",
            "https://www.publimetro.com.mx/mx/futbol-nacional/",
            "https://www.publimetro.com.mx/mx/futbol-internacional/",
            "https://www.publimetro.com.mx/mx/seleccion-mexicana/",
            "https://www.publimetro.com.mx/mx/nfl/",
            "https://www.publimetro.com.mx/mx/formula-1/",
            "https://www.publimetro.com.mx/mx/gurus-deportivos/",
            "https://www.publimetro.com.mx/mx/entretenimiento/",
            "https://www.publimetro.com.mx/mx/gana/",
            "https://www.publimetro.com.mx/mx/futbol-nacional/",
            "https://www.publimetro.com.mx/mx/estilo-vida/",
            "https://www.publimetro.com.mx/mx/plus/",
            "https://www.publimetro.com.mx/mx/viajeros/",
            "https://www.publimetro.com.mx/mx/educacion/",
            "https://www.publimetro.com.mx/mx/interiorismo/",
            "https://www.publimetro.com.mx/mx/tecnologia/",
            "https://www.publimetro.com.mx/mx/opinion.shtml",
            "https://www.publimetro.com.mx/mx/publimetro-tv.shtml",
            "https://www.publimetro.com.mx/mx/verificado/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f"www.publimetro.com.mx\/mx\/.+({self.date_allow_str}).+.html"],
            deny_re=[],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.publimetro.com.mx/mx/sitemap/sitemap.xml",
            "https://www.publimetro.com.mx/mx/sitemap/news-sitemap.xml",
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
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "body-content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "metroEmbed"),
                (AttributeType.CLASS, "suscribe"),
                (AttributeType.TARGET, "_blank"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "MuiContainer-root")]//div[contains(@class, "MuiGrid-root")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "metroEmbed"),
                (AttributeType.CLASS, "MuiCollapse"),
                (AttributeType.CLASS, "suscribe"),
                (AttributeType.CLASS, "trc_related"),
                (AttributeType.TARGET, "_blank"),
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
