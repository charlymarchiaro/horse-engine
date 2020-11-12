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
            concat_fn=lambda year, month, day: f"/{year}{month}{day}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "es__la_vanguardia"

    def get_allowed_domains(self) -> List[str]:
        return ["lavanguardia.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lavanguardia.com/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f".*({self.date_allow_str})\d{{5,}}\/.*.html"], deny_re=[]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return []

    def get_rss_urls(self) -> List[str]:
        return [
            "https://www.lavanguardia.com/mvc/feed/rss/home",
            "https://www.lavanguardia.com/mvc/feed/rss/internacional",
            "https://www.lavanguardia.com/mvc/feed/rss/politica",
            "https://www.lavanguardia.com/mvc/feed/rss/vida",
            "https://www.lavanguardia.com/mvc/feed/rss/deportes",
            "https://www.lavanguardia.com/mvc/feed/rss/economia",
            "https://www.lavanguardia.com/mvc/feed/rss/opinion",
            "https://www.lavanguardia.com/mvc/feed/rss/cultura",
            "https://www.lavanguardia.com/mvc/feed/rss/gente",
            "https://www.lavanguardia.com/mvc/feed/rss/sucesos",
            "https://www.lavanguardia.com/mvc/feed/rss/participacion",
            "https://www.lavanguardia.com/mvc/feed/rss/videos",
            "https://www.lavanguardia.com/mvc/feed/rss/temas",
            "https://www.lavanguardia.com/mvc/feed/rss/vangdata",
            "https://www.lavanguardia.com/mvc/feed/rss/vida/lacontra",
            "https://www.lavanguardia.com/mvc/feed/rss/vida/natural",
            "https://www.lavanguardia.com/mvc/feed/rss/ciencia",
            "https://www.lavanguardia.com/mvc/feed/rss/vida/salud",
            "https://www.lavanguardia.com/mvc/feed/rss/tecnologia",
            "https://www.lavanguardia.com/mvc/feed/rss/ocio/television",
            "https://www.lavanguardia.com/mvc/feed/rss/ocio/series",
            "https://www.lavanguardia.com/mvc/feed/rss/gente/fans",
            "https://www.lavanguardia.com/mvc/feed/rss/ocio/viajes",
            "https://www.lavanguardia.com/mvc/feed/rss/ocio/motor",
            "https://www.lavanguardia.com/mvc/feed/rss/de-moda",
            "https://www.lavanguardia.com/mvc/feed/rss/vivo",
            "https://www.lavanguardia.com/mvc/feed/rss/comer",
            "https://www.lavanguardia.com/mvc/feed/rss/local/barcelona",
            "https://www.lavanguardia.com/mvc/feed/rss/local/tarragona",
            "https://www.lavanguardia.com/mvc/feed/rss/local/lleida",
            "https://www.lavanguardia.com/mvc/feed/rss/local/girona",
            "https://www.lavanguardia.com/mvc/feed/rss/local/madrid",
            "https://www.lavanguardia.com/mvc/feed/rss/local/sevilla",
            "https://www.lavanguardia.com/mvc/feed/rss/local/valencia",
            "https://www.lavanguardia.com/mvc/feed/rss/local/paisvasco",
            "https://www.lavanguardia.com/mvc/feed/rss/local/catalunya",
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
            root_xpath='//div[contains(@itemprop,"articleBody")]',
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
