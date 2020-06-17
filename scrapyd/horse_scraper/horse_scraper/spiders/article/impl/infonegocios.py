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
        return "infonegocios"

    def get_allowed_domains(self) -> List[str]:
        return ["infonegocios.info"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://infonegocios.info/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[
                ".*\/nota-principal\/.*",
                ".*\/enfoque\/.*",
                ".*\/un-cafe-con\/.*",
                ".*\/en-foco\/.*",
                ".*\/plus\/.*",
                ".*\/top-100-brands\/.*",
                ".*\/bien-de-familia\/.*",
                ".*\/politica-y-algo-mas\/.*",
                ".*\/infobursatil\/.*",
                ".*\/in-carlos-paz\/.*",
                ".*\/y-ademas\/.*",
                ".*\/si-estas-por-buenos-aires\/.*",
                ".*\/infotrivias\/.*",
                ".*\/contenido-patrocinado\/.*",
                ".*\/infopublicidad\/.*",
                ".*\/infovino\/.*",
                ".*\/infogerentes\/.*",
                ".*\/infoautos\/.*",
                ".*\/infotecnologia\/.*",
            ],
            deny_re=[".*link:.*", ".*automotiva.com.ar.*"],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://infonegocios.info/sitemap_categories_posts.xml"]

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
            root_xpath='//section[contains(@itemprop, "articleBody")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # Infoautos, infotecnologia
    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "description")]',
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
