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
        return "infonegocios"

    def get_allowed_domains(self) -> List[str]:
        return ["infonegocios.info"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://infonegocios.info/",
            "https://infonegocios.info/nota-principal",
            "https://infonegocios.info/infopublicidad",
            "https://infonegocios.info/infogerentes",
            "https://infonegocios.info/plus",
            "https://infonegocios.info/que-dice-la-gente",
            "https://infonegocios.info/y-ademas",
            "https://infonegocios.info/infotrivias",
            "https://infonegocios.info/infoganadores",
            "https://infonegocios.info/infoautos",
            "https://infonegocios.info/infotecnologia",
            "https://infonegocios.info/lo-que-viene",
            "https://infonegocios.info/infonegocios-en-uy",
            "https://infonegocios.info/infonegocios-en-py",
            "https://infonegocios.info/hay-equipo",
            "https://infonegocios.info/que-esta-pasando-ahora",
            "https://infonegocios.info/que-esta-pasando",
            "https://infonegocios.info/un-cafe-con",
            "https://infonegocios.info/inforecuerdos",
            "https://infonegocios.info/infoencuesta",
            "https://infonegocios.info/enfoque",
            "https://infonegocios.info/ciudad-informa",
            "https://infonegocios.info/in-neuquen",
            "https://infonegocios.info/in-mar-del-plata",
            "https://infonegocios.info/in-tucuman",
            "https://infonegocios.info/in-salta",
            "https://infonegocios.info/in-litoral",
            "https://infonegocios.info/infonegocios-miami",
            "https://infonegocios.info/columnista-invitado",
            "https://infonegocios.info/in-semanal",
            "https://infonegocios.info/40-de-las-grandes",
            "https://infonegocios.info/infobursatil",
            "https://infonegocios.info/in-litoral-1",
            "https://infonegocios.info/financial-times",
            "https://infonegocios.info/infomujeres-1",
            "https://infonegocios.info/las-rosas",
            "https://infonegocios.info/el-cronista",
            "https://infonegocios.info/bien-de-familia",
            "https://infonegocios.info/in-bahia-blanca",
            "https://infonegocios.info/in-jujuy",
            "https://infonegocios.info/in-mendoza",
            "https://infonegocios.info/si-estas-por-buenos-aires",
            "https://infonegocios.info/politica-y-algo-mas",
            "https://infonegocios.info/in-carlos-paz",
            "https://infonegocios.info/in-san-francisco",
            "https://infonegocios.info/contenido-patrocinado",
            "https://infonegocios.info/en-foco",
            "https://infonegocios.info/top-100-brands",
            "https://infonegocios.info/infovino",
        ]

    def get_url_filter(self) -> UrlFilter:

        return UrlFilter(
            allow_re=[".*infonegocios.info\/.+\/.{10,}"],
            deny_re=[
                ".*infonegocios.info\/.+\/.+\/.*",
                ".*page=\d+.*",
                ".*link:.*",
                ".*automotiva.com.ar.*",
            ],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            # Sitemap disabled because article dates are wrongly set
            # as the most recent date for the entire list.
            # "https://infonegocios.info/sitemap_categories_posts.xml"
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
            self.parser_2,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//section[contains(@itemprop, "articleBody")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # Infoautos, infotecnologia
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
