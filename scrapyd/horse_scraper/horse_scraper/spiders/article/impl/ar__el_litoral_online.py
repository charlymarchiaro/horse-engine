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
        return "ar__el_litoral_online"

    def get_allowed_domains(self) -> List[str]:
        return ["ellitoral.com"]

    def pre_process_url(self, url) -> str:
        return url.replace("/m.ellitoral.com/", "/www.ellitoral.com/")

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.ellitoral.com/",
            "https://www.ellitoral.com/index.php/titulos",
            "https://www.ellitoral.com/index.php/um/area_metropolitana",
            "https://www.ellitoral.com/index.php/um/sucesos",
            "https://www.ellitoral.com/index.php/um/deportes",
            "https://www.ellitoral.com/index.php/um/politica",
            "https://www.ellitoral.com/index.php/um/opinion",
            "https://www.ellitoral.com/index.php/temas/Filtrado",
            "https://www.ellitoral.com/index.php/temas/Tecno",
            "https://www.ellitoral.com/index.php/um/sabalera",
            "https://www.ellitoral.com/index.php/um/tatengue",
            "https://www.ellitoral.com/index.php/participacion/periodismo",
            "https://www.ellitoral.com/index.php/participacion/",
            "https://www.ellitoral.com/index.php/servicios",
            "https://www.ellitoral.com/index.php/servicios/clima",
            "https://www.ellitoral.com/index.php/temas/El-Litoral-Podcasts",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*\/id_um\/\d{5}\d*-.*"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.ellitoral.com/barra/estatico/sitemap.xml",
            "https://www.ellitoral.com/barra/estatico/sitemap_mobile.xml",
            "https://www.ellitoral.com/barra/estatico/sitemap_indice.xml",
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
            root_xpath='//div[contains(@class, "cuerpo_interior")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionada"),
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
