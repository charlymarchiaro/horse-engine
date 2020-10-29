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
        # Override to stop redirects
        self.dont_redirect = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ar__los_andes_mendoza"

    def get_allowed_domains(self) -> List[str]:
        return ["losandes.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.losandes.com.ar/",
            "https://www.losandes.com.ar/da-la-nota/",
            "https://www.losandes.com.ar/economia/",
            "https://www.losandes.com.ar/edicion-u/",
            "https://www.losandes.com.ar/estilo/",
            "https://www.losandes.com.ar/guarda14/",
            "https://www.losandes.com.ar/mas-deportes/",
            "https://www.losandes.com.ar/mundo/",
            "https://www.losandes.com.ar/nuevo-cuyo/",
            "https://www.losandes.com.ar/opinion/",
            "https://www.losandes.com.ar/policiales/",
            "https://www.losandes.com.ar/politica/",
            "https://www.losandes.com.ar/por-las-redes/",
            "https://www.losandes.com.ar/rumbos/",
            "https://www.losandes.com.ar/sociedad/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*losandes.com.ar\/.+\/.{10,}(\/)?$",],
            deny_re=[
                ".*losandes.com.ar\/.+\/.+\/.+",
                ".*\/temas\/.*",
                ".*\/autor\/.*",
                ".*\/\d+\/",
                "category=",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.losandes.com.ar/arcio/sitemap/",
            "https://www.losandes.com.ar/arcio/news-sitemap/",
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
            root_xpath='//section[contains(@class, "body")]',
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
