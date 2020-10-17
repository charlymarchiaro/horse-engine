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
        return "ar__in_salta"

    def get_allowed_domains(self) -> List[str]:
        return ["insalta.info"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://insalta.info/",
            "https://insalta.info/que-esta-pasando",
            "https://insalta.info/nota-principal",
            "https://insalta.info/enfoque",
            "https://insalta.info/plus",
            "https://insalta.info/infoencuesta",
            "https://insalta.info/que-dice-la-gente",
            "https://insalta.info/y-ademas",
            "https://insalta.info/infotrivias",
            "https://insalta.info/infoganadores",
            "https://insalta.info/infotecnologia",
            "https://insalta.info/infoautos",
            "https://insalta.info/infogerentes",
            "https://insalta.info/infonegocios-en-py",
            "https://insalta.info/infonegocios-en-uy",
            "https://insalta.info/in-cordoba",
            "https://insalta.info/in-neuquen",
            "https://insalta.info/in-mar-del-plata",
            "https://insalta.info/in-tucuman",
            "https://insalta.info/in-litoral",
            "https://insalta.info/infonegocios-en-us",
            "https://insalta.info/in-litoral-1",
            "https://insalta.info/bien-de-familia",
            "https://insalta.info/el-cronista",
            "https://insalta.info/las-rosas",
            "https://insalta.info/in-bahia-blanca",
            "https://insalta.info/in-jujuy",
            "https://insalta.info/in-mendoza",
            "https://insalta.info/top-100-brands",
            "https://insalta.info/infomendoza",
            "https://insalta.info/infovino",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*insalta.info\/.+\/.{10,}"],
            deny_re=[".*insalta.info\/.+\/.+\/.+",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            # Sitemap disabled because article dates are wrongly set
            # as the most recent date for the entire list.
            # "https://insalta.info/sitemap_categories_posts.xml"
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
