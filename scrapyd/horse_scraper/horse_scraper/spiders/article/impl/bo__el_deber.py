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
        return "bo__el_deber"

    def get_allowed_domains(self) -> List[str]:
        return ["eldeber.com.bo"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://eldeber.com.bo/",
            "https://eldeber.com.bo/santa-cruz",
            "https://eldeber.com.bo/pais",
            "https://eldeber.com.bo/usted-elige",
            "https://eldeber.com.bo/economia",
            "https://eldeber.com.bo/opinion",
            "https://eldeber.com.bo/mundo",
            "https://eldeber.com.bo/salud-y-bienestar",
            "https://eldeber.com.bo/tecnologia",
            "https://eldeber.com.bo/diez",
            "https://eldeber.com.bo/comunicados",
            "https://eldeber.com.bo/semilla-capital",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["eldeber.com.bo\/.+\/.+_\d+$"], deny_re=["\/autor\/"]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://eldeber.com.bo/sitemap.xml",
            "https://eldeber.com.bo/sitemap-google-news.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return ["sitemap_news"]

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
            root_xpath='//div[contains(@class, "text-editor")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "audio-player"),
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
