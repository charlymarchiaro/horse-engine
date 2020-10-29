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
        return "ec__el_comercio"

    def get_allowed_domains(self) -> List[str]:
        return ["elcomercio.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.elcomercio.com/",
            "https://www.elcomercio.com/actualidad",
            "https://www.elcomercio.com/venezolanos-en-ecuador",
            "https://www.elcomercio.com/periodistas-en-la-frontera-norte",
            "https://www.elcomercio.com/tendencias",
            "https://www.elcomercio.com/deportes",
            "https://www.elcomercio.com/datos",
            "https://www.elcomercio.com/opinion",
            "https://www.elcomercio.com/opinion/editorial",
            "https://www.elcomercio.com/opinion/caricaturas",
            "https://www.elcomercio.com/columnistas",
            "https://www.elcomercio.com/cartas",
            "https://www.elcomercio.com/multimedia",
            "https://www.elcomercio.com/video",
            "https://www.elcomercio.com/galerias",
            "https://www.elcomercio.com/audios",
            "https://www.elcomercio.com/blogs",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["elcomercio.com\/.+\/.+.html$"],
            deny_re=["lcomercio.com\/.+\/.+\/.*", "\/pages\/",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.elcomercio.com/sitemap-index.xml",
            "https://www.elcomercio.com/sitemap-google-news.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return ["sitemap-articles"]

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
            root_xpath='//div[contains(@class, "paragraphs")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "content_cx"),
                (AttributeType.CLASS, "link-wrapper"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # galerías
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
