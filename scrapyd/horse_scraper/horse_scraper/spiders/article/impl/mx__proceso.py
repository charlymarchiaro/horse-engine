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
            month_format="1",
            day_format="1",
            concat_fn=lambda year, month, day: f"/{year}/{month}/{day}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "mx__proceso"

    def get_allowed_domains(self) -> List[str]:
        return ["proceso.com.mx"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.proceso.com.mx/",
            "https://www.proceso.com.mx/category/reportajes",
            "https://www.proceso.com.mx/reportajes/entrevista",
            "https://www.proceso.com.mx/reportajes/cronica",
            "https://www.proceso.com.mx/perfil",
            "https://www.proceso.com.mx/presidencia",
            "https://www.proceso.com.mx/opinion",
            "https://www.proceso.com.mx/opinion/analisis",
            "https://www.proceso.com.mx/opinion/columna",
            "https://www.proceso.com.mx/reportajes/testimonio",
            "https://www.proceso.com.mx/ensayo",
            "https://www.proceso.com.mx/carton",
            "https://www.proceso.com.mx/proceso-tv",
            "https://www.proceso.com.mx/nacional",
            "https://www.proceso.com.mx/estados",
            "https://www.proceso.com.mx/economia-y-negocios",
            "https://www.proceso.com.mx/la-capital",
            "https://www.proceso.com.mx/internacional",
            "https://www.proceso.com.mx/prisma-internacional",
            "https://www.proceso.com.mx/covid-19",
            "https://www.proceso.com.mx/home-cultura",
            "https://www.proceso.com.mx/c-cultura/cultura-en-la-mira",
            "https://www.proceso.com.mx/c-cultura/estro-armonico",
            "https://www.proceso.com.mx/c-cultura/c-culturayespectaculos/toledo-lee",
            "https://www.proceso.com.mx/podcast",
            "https://www.proceso.com.mx/tecnologia",
            "https://www.proceso.com.mx/deportes",
            "https://www.proceso.com.mx/justicia-patriarcal",
            "https://www.proceso.com.mx/miscelanea",
            "https://www.proceso.com.mx/palabra-de-lector",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str}).*\d+.html"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.proceso.com.mx/sitemaps/",
            "https://www.proceso.com.mx/sitemaps/indexnews.asp",
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
            root_xpath='//div[contains(@class, "cuerpo-nota")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionadas"),
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
