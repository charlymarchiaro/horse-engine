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
        # Enable Selenium to parse dynamically loaded content
        self.selenium_enabled = True
        self.selenium_wait_time = 0.5

    # Common params
    def _get_spider_base_name(self) -> str:
        return "dbiz_today"

    def get_allowed_domains(self) -> List[str]:
        return ["dbiz.today"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://dbiz.today/",
            "http://dbiz.today/Home/",
            "http://dbiz.today/Empresas/MotoresBiz/",
            "http://dbiz.today/Empresas/Servicios/",
            "http://dbiz.today/Empresas/Agro/",
            "http://dbiz.today/Empresas/PyMES/",
            "http://dbiz.today/Eco-RSE/",
            "http://dbiz.today/Sport_Business/",
            "http://dbiz.today/Bon_Vivire/GourmetBiz/",
            "http://dbiz.today/Bon_Vivire/Turismo/",
            "http://dbiz.today/Bon_Vivire/ModaBiz/",
            "http://dbiz.today/TecnoBiz/",
            "http://dbiz.today/Portfolio/",
            "http://dbiz.today/Agenda-Eventos/",
        ]

    def get_url_filter(self) -> UrlFilter:
        allowed_categories = [
            "Home",
            "Sport_Business",
            "Empresas",
            "TecnoBiz",
            "Eco-RSE",
            "Bon_Vivire",
            "Agenda-Eventos",
            "Portfolio",
            "Publicidad",
            "Quienes_Somos",
            "Meta",
            "Movil",
            "prodecopa",
        ]
        allowed_categories_str = "|".join(allowed_categories)

        return UrlFilter(allow_re=[f".*\/({allowed_categories_str})\/.*"], deny_re=[])

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
            self.parser_2,
            self.parser_3,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath="(//article)[1]",
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response, root_xpath="((//article)[1]/p)[1]", exclude_list=[],
            )
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath="(//article)[1]",
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        # last_updated
        # Publish dates are missing --> use current datetime
        last_updated = datetime.now()

        return ArticleData(title, text, last_updated)

    def parser_3(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        text = article_data.text

        # last_updated
        # Publish dates are missing --> use current datetime
        last_updated = datetime.now()

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
