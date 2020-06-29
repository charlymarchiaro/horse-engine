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
        return "in_bahia_blanca"

    def get_allowed_domains(self) -> List[str]:
        return ["inbahiablanca.info"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://inbahiablanca.info/",
            "https://inbahiablanca.info/nota-principal",
            "https://inbahiablanca.info/infoautos",
            "https://inbahiablanca.info/infogerentes",
            "https://inbahiablanca.info/infotecnologia",
            "https://inbahiablanca.info/el-cronista",
            "https://inbahiablanca.info/infoencuesta",
            "https://inbahiablanca.info/que-dice-la-gente",
            "https://inbahiablanca.info/enfoque",
            "https://inbahiablanca.info/plus",
            "https://inbahiablanca.info/y-ademas",
            "https://inbahiablanca.info/in-cordoba",
            "https://inbahiablanca.info/in-litoral",
            "https://inbahiablanca.info/in-neuquen",
            "https://inbahiablanca.info/in-salta",
            "https://inbahiablanca.info/in-tucuman",
            "https://inbahiablanca.info/infonegocios-en-py",
            "https://inbahiablanca.info/infonegocios-en-uy",
            "https://inbahiablanca.info/que-esta-pasando",
            "https://inbahiablanca.info/las-rosas",
            "https://inbahiablanca.info/in-mar-del-plata",
            "https://inbahiablanca.info/in-jujuy",
            "https://inbahiablanca.info/in-mendoza",
            "https://inbahiablanca.info/bien-de-familia",
            "https://inbahiablanca.info/un-cafe-con",
            "https://inbahiablanca.info/contenido-patrocinado",
            "https://inbahiablanca.info/top-100-brands",
            "https://inbahiablanca.info/infovinos",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*inbahiablanca.info\/.+\/.{10,}"],
            deny_re=[".*inbahiablanca.info\/.+\/.+\/.+",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            # Sitemap disabled because article dates are wrongly set
            # as the most recent date for the entire list.
            # "https://inbahiablanca.info/sitemap_categories_posts.xml"
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
