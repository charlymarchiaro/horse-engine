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
        return "mx__el_economista"

    def get_allowed_domains(self) -> List[str]:
        return ["eleconomista.com.mx"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.eleconomista.com.mx/",
            "https://www.eleconomista.com.mx/seccion/empresas",
            "https://www.eleconomista.com.mx/seccion/autos",
            "https://www.eleconomista.com.mx/seccion/mercados",
            "https://www.eleconomista.com.mx/seccion/economia",
            "https://www.eleconomista.com.mx/seccion/sector-financiero",
            "https://www.eleconomista.com.mx/seccion/estados",
            "https://www.eleconomista.com.mx/seccion/politica",
            "https://www.eleconomista.com.mx/seccion/internacionales",
            "https://www.eleconomista.com.mx/seccion/finanzas-personales",
            "https://www.eleconomista.com.mx/seccion/gestion",
            "https://www.eleconomista.com.mx/seccion/energia",
            "https://www.eleconomista.com.mx/seccion/tecnologia",
            "https://www.eleconomista.com.mx/seccion/turismo",
            "https://www.eleconomista.com.mx/seccion/arte-ideas",
            "https://www.eleconomista.com.mx/seccion/deportes",
            "https://www.eleconomista.com.mx/seccion/opinion",
            "https://www.eleconomista.com.mx/seccion/cartones",
            "https://www.eleconomista.com.mx/seccion/hemeroteca",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f".*-({self.date_allow_str})-\d+.html"], deny_re=["\/cartones\/"]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.eleconomista.com.mx/sitemaps/googlenews.xml",
            "https://www.eleconomista.com.mx/sitemaps/index.xml",
            "https://www.eleconomista.com.mx/sitemaps/daily.xml",
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
            root_xpath='//div[contains(@class, "entry-body")]',
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
