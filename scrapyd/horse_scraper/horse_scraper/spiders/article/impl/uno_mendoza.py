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

from selenium.webdriver.common.by import By  # type: ignore
from selenium.webdriver.support import expected_conditions as EC  # type: ignore


class Params(BaseArticleSpiderParams):
    def _after_initialize(self) -> None:
        self.date_allow_str = self.get_date_allow_str(
            year_format="04",
            month_format="02",
            day_format="02",
            concat_fn=lambda year, month, day: f"{month}{day}{year}",
        )
        # Enable Selenium to parse dynamically loaded content
        self.selenium_enabled = True
        self.selenium_wait_time = 0.5

    # Common params
    def _get_spider_base_name(self) -> str:
        return "uno_mendoza"

    def get_allowed_domains(self) -> List[str]:
        return ["diariouno.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.diariouno.com.ar/",
            "https://www.diariouno.com.ar/politica",
            "https://www.diariouno.com.ar/ovacion",
            "https://www.diariouno.com.ar/sociedad",
            "https://www.diariouno.com.ar/mundo",
            "https://www.diariouno.com.ar/policiales",
            "https://www.diariouno.com.ar/economia",
            "https://www.diariouno.com.ar/farandula",
            "https://www.diariouno.com.ar/espectaculos",
            "https://www.diariouno.com.ar/viralesinsolitas",
            "https://www.diariouno.com.ar/tecnologia",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*-({self.date_allow_str})\_.+"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.diariouno.com.ar/news-sitemap.xml"]

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
        text = article_data.text

        # last_updated
        match = re.search(f".*-({self.date_allow_str})\_.+", response.url)
        if match:
            match = re.search(
                "(?P<month>\d{2})(?P<day>\d{2})(?P<year>\d{4})", match.group(1)
            )
            if match:
                last_updated = dateparser.parse(
                    f"{match.group('year')}-{match.group('month')}-{match.group('day')}"
                )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
