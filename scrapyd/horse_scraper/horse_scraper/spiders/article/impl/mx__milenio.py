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
        return "mx__milenio"

    def get_allowed_domains(self) -> List[str]:
        return ["milenio.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.milenio.com/",
            "https://www.milenio.com/ultima-hora",
            "https://www.milenio.com/coronavirus-mexico-mundo",
            "https://www.milenio.com/politica",
            "https://www.milenio.com/estados",
            "https://www.milenio.com/policia",
            "https://www.milenio.com/negocios",
            "https://www.milenio.com/internacional",
            "https://www.milenio.com/estilo",
            "https://www.milenio.com/cultura",
            "https://www.milenio.com/espectaculos",
            "https://www.milenio.com/deportes",
            "https://www.milenio.com/milenio-foros",
            "https://www.milenio.com/vinos-descorche",
            "https://www.milenio.com/content",
            "https://www.milenio.com/virales",
            "https://www.milenio.com/especiales",
            "https://www.milenio.com/fotogalerias",
            "https://www.milenio.com/cultura/laberinto",
            "https://www.milenio.com/mileniovr",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["milenio.com\/.+\/.{10,}"],
            deny_re=[
                "publicidad.milenio.com",
                "descuentos.milenio.com",
                ".*\/cupones\/.*",
                ".*\/temas\/.*",
                ".*\/audio\?.*",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.milenio.com/sitemap/sitemap-articles-index.xml",
            "https://www.milenio.com/sitemap/sitemap-google-news-current.xml",
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
            # self.parser_1,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div [@class="newsfull__content"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionadas"),
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
