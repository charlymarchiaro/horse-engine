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
        return "ar__in_tucuman"

    def get_allowed_domains(self) -> List[str]:
        return ["intucuman.info"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://intucuman.info/",
            "https://intucuman.info/que-esta-pasando",
            "https://intucuman.info/que-esta-pasando-ahora",
            "https://intucuman.info/nota-principal",
            "https://intucuman.info/enfoque",
            "https://intucuman.info/columnista-invitado",
            "https://intucuman.info/plus",
            "https://intucuman.info/infoencuesta",
            "https://intucuman.info/y-ademas",
            "https://intucuman.info/infotrivias",
            "https://intucuman.info/infoganadores",
            "https://intucuman.info/infopublicidad",
            "https://intucuman.info/infotecnologia",
            "https://intucuman.info/infoautos",
            "https://intucuman.info/infogerentes",
            "https://intucuman.info/infonegocios-en-py",
            "https://intucuman.info/infonegocios-en-us",
            "https://intucuman.info/infonegocios-en-uy",
            "https://intucuman.info/in-cordoba",
            "https://intucuman.info/in-salta",
            "https://intucuman.info/in-litoral",
            "https://intucuman.info/in-mar-del-plata",
            "https://intucuman.info/in-neuquen",
            "https://intucuman.info/in-litoral-1",
            "https://intucuman.info/bien-de-familia",
            "https://intucuman.info/el-cronista",
            "https://intucuman.info/las-rosas",
            "https://intucuman.info/in-bahia-blanca",
            "https://intucuman.info/in-jujuy",
            "https://intucuman.info/in-mendoza",
            "https://intucuman.info/top-100-brands",
            "https://intucuman.info/infomendoza",
            "https://intucuman.info/infovino",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*intucuman.info\/.+\/.{10,}"],
            deny_re=[".*intucuman.info\/.+\/.+\/.+",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            # Sitemap disabled because article dates are wrongly set
            # as the most recent date for the entire list.
            # "https://intucuman.info/sitemap_categories_posts.xml"
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
