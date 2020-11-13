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
            concat_fn=lambda year, month, day: f"/{year}/{month}/{day}/",
        )
        # Override to stop redirects
        self.dont_redirect = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "es__la_voz_de_galicia"

    def get_allowed_domains(self) -> List[str]:
        return ["lavozdegalicia.es"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lavozdegalicia.es/",
            "https://www.lavozdegalicia.es/galicia/",
            "https://www.lavozdegalicia.es/localidades/",
            "https://www.lavozdegalicia.es/economia/",
            "https://www.lavozdegalicia.es/espana/",
            "https://www.lavozdegalicia.es/internacional/",
            "https://www.lavozdegalicia.es/opinion/",
            "https://www.lavozdegalicia.es/deportes/",
            "https://www.lavozdegalicia.es/sociedad/",
            "https://www.lavozdegalicia.es/cultura/",
            "https://www.lavozdegalicia.es/maritima/",
            "https://www.lavozdegalicia.es/hemeroteca/",
            "https://www.lavozdegalicia.es/coruna/",
            "https://www.lavozdegalicia.es/amarina/",
            "https://www.lavozdegalicia.es/arousa/",
            "https://www.lavozdegalicia.es/barbanza/",
            "https://www.lavozdegalicia.es/carballo/",
            "https://www.lavozdegalicia.es/deza/",
            "https://www.lavozdegalicia.es/ferrol/",
            "https://www.lavozdegalicia.es/lemos/",
            "https://www.lavozdegalicia.es/lugo/",
            "https://www.lavozdegalicia.es/ourense/",
            "https://www.lavozdegalicia.es/pontevedra/",
            "https://www.lavozdegalicia.es/santiago/",
            "https://www.lavozdegalicia.es/vigo/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f".*({self.date_allow_str}).*\d+.htm$"], deny_re=["\?"]
        )

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
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text1 = (
            extract_all_text(
                response,
                root_xpath='//*[contains(@itemprop,"alternativeHeadline")]',
                exclude_list=[
                    (AttributeType.NAME, "script"),
                    (AttributeType.NAME, "style"),
                ],
            )
            or ""
        )

        text2 = extract_all_text(
            response,
            root_xpath='//div[contains(@itemprop,"text")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.ID, "social-share"),
                (AttributeType.CLASS, "item"),
                (AttributeType.CLASS, "afondo"),
                (AttributeType.CLASS, "rel"),
                (AttributeType.ID, "newsletter"),
                (AttributeType.ID, "footer"),
                (AttributeType.ID, "subscription"),
            ],
        )
        text = text1 + ". " + text2

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
