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
        return "co__el_tiempo"

    def get_allowed_domains(self) -> List[str]:
        return ["eltiempo.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.eltiempo.com/",
            "https://www.eltiempo.com/opinion/",
            "https://www.eltiempo.com/colombia/",
            "https://www.eltiempo.com/bogota/",
            "https://www.eltiempo.com/mundo/",
            "https://www.eltiempo.com/politica/",
            "https://www.eltiempo.com/justicia/",
            "https://www.eltiempo.com/economia/",
            "https://www.eltiempo.com/deportes/",
            "https://www.eltiempo.com/cultura/",
            "https://www.eltiempo.com/tecnosfera/",
            "https://www.eltiempo.com/vida/",
            "https://www.eltiempo.com/salud/",
            "https://www.eltiempo.com/unidad-investigativa/",
            "https://www.eltiempo.com/especiales/",
            "https://www.eltiempo.com/datos/",
            "https://www.eltiempo.com/carrusel/",
            "https://www.eltiempo.com/bocas/",
            "https://www.eltiempo.com/lecturas-dominicales/",
            "https://www.eltiempo.com/pico-y-placa/",
            "https://www.eltiempo.com/clima/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*-\d{4,}$"],
            deny_re=["\/noticias\/", "\/caricaturas\/", "tema-del-dia-la-w",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.eltiempo.com/sitemap-index.xml",
            "https://www.eltiempo.com/sitemap-google-news.xml",
            "https://www.eltiempo.com/sitemap-articles-current.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [
            ".*sitemap-articles.*",
        ]

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
            root_xpath='//div[contains(@itemprop, "articleBody")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionados"),
                (AttributeType.CLASS, "compartir"),
                (AttributeType.TARGET, "_blank"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # video
    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "apertura")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "seguir"),
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
