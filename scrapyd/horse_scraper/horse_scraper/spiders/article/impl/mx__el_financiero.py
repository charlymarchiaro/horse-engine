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
        return "mx__el_financiero"

    def get_allowed_domains(self) -> List[str]:
        return ["elfinanciero.com.mx"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.elfinanciero.com.mx/",
            "https://www.elfinanciero.com.mx/economia",
            "https://www.elfinanciero.com.mx/mercados",
            "https://www.elfinanciero.com.mx/opinion",
            "https://www.elfinanciero.com.mx/nacional",
            "https://www.elfinanciero.com.mx/estados",
            "https://www.elfinanciero.com.mx/tv",
            "https://www.elfinanciero.com.mx/empresas",
            "https://www.elfinanciero.com.mx/bloomberg-businessweek",
            "https://www.elfinanciero.com.mx/tech",
            "https://www.elfinanciero.com.mx/mundo",
            "https://www.elfinanciero.com.mx/encuestas",
            "https://www.elfinanciero.com.mx/salud",
            "https://www.elfinanciero.com.mx/el-preguntario",
            "https://www.elfinanciero.com.mx/estilo",
            "https://www.elfinanciero.com.mx/mis-finanzas",
            "https://www.elfinanciero.com.mx/cultura",
            "https://www.elfinanciero.com.mx/deportes",
            "https://www.elfinanciero.com.mx/algarabia",
            "https://www.elfinanciero.com.mx/cdmx",
            "https://www.elfinanciero.com.mx/peninsula",
            "https://www.elfinanciero.com.mx/monterrey",
            "https://www.elfinanciero.com.mx/edomex",
            "https://www.elfinanciero.com.mx/reflector",
            "https://www.elfinanciero.com.mx/ciencia",
            "https://www.elfinanciero.com.mx/interactivos",
            "https://www.elfinanciero.com.mx/inmobiliario ",
            "https://www.elfinanciero.com.mx/autos",
            "https://www.elfinanciero.com.mx/viajes",
            "https://www.elfinanciero.com.mx/transporte-y-movilidad ",
            "https://www.elfinanciero.com.mx/jalisco",
            "https://www.elfinanciero.com.mx/queretaro",
            "https://www.elfinanciero.com.mx/sonora",
            "https://www.elfinanciero.com.mx/sinaloa",
            "https://www.elfinanciero.com.mx/mundo-empresa",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=["www.elfinanciero.com.mx\/.+\/.{10,}"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.elfinanciero.com.mx/sitemap.xml",
            "https://www.elfinanciero.com.mx/sitemap-google-news.xml",
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
            root_xpath='//div[contains(@class, "main-article-text")]//*[contains(@class, "content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.ID, "embed"),
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
            root_xpath='//div[contains(@class, "content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.ID, "embed"),
                (AttributeType.TARGET, "_blank"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_3(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # last_updated ----------
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='//span[contains(@class, "publish")]',
                exclude_list=[],
            ),
            settings={"DATE_ORDER": "DMY"},
        )

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.ID, "embed"),
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
