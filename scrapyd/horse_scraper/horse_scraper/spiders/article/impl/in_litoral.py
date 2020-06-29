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
        return "in_litoral"

    def get_allowed_domains(self) -> List[str]:
        return ["inlitoral.info"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://inlitoral.info/",
            "https://inlitoral.info/enfoque",
            "https://inlitoral.info/infoautos",
            "https://inlitoral.info/infoencuesta",
            "https://inlitoral.info/infogerentes",
            "https://inlitoral.info/infonegocios-en-py",
            "https://inlitoral.info/infonegocios-en-uy",
            "https://inlitoral.info/infotecnologia",
            "https://inlitoral.info/infotrivias",
            "https://inlitoral.info/nota-principal",
            "https://inlitoral.info/plus",
            "https://inlitoral.info/que-dice-la-gente",
            "https://inlitoral.info/que-esta-pasando",
            "https://inlitoral.info/y-ademas",
            "https://inlitoral.info/que-esta-pasando-ahora",
            "https://inlitoral.info/infoganadores",
            "https://inlitoral.info/in-cordoba",
            "https://inlitoral.info/in-neuquen",
            "https://inlitoral.info/in-mar-del-plata",
            "https://inlitoral.info/in-tucuman",
            "https://inlitoral.info/in-salta",
            "https://inlitoral.info/infonegocios-en-us",
            "https://inlitoral.info/bien-de-familia",
            "https://inlitoral.info/el-cronista",
            "https://inlitoral.info/las-rosas",
            "https://inlitoral.info/in-bahia-blanca",
            "https://inlitoral.info/in-jujuy",
            "https://inlitoral.info/in-mendoza",
            "https://inlitoral.info/un-cafe-con",
            "https://inlitoral.info/contenido-patrocinado",
            "https://inlitoral.info/top-100-brands",
            "https://inlitoral.info/infovinos",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*inlitoral.info\/.+\/.{10,}"],
            deny_re=[".*inlitoral.info\/.+\/.+\/.+",],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            # Sitemap disabled because article dates are wrongly set
            # as the most recent date for the entire list.
            # "https://inlitoral.info/sitemap_categories_posts.xml"
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
