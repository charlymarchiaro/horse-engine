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
        return "ar__uno_entre_rios"

    def get_allowed_domains(self) -> List[str]:
        return ["unoentrerios.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.unoentrerios.com.ar/",
            "https://www.unoentrerios.com.ar/secciones/provincia.html",
            "https://www.unoentrerios.com.ar/secciones/policiales.html",
            "https://www.unoentrerios.com.ar/secciones/ovacion.html",
            "https://www.unoentrerios.com.ar/secciones/ovacion-extreme.html",
            "https://www.unoentrerios.com.ar/secciones/uno-tv.html",
            "https://www.unoentrerios.com.ar/secciones/escenario.html",
            "https://www.unoentrerios.com.ar/secciones/show.html",
            "https://www.unoentrerios.com.ar/secciones/miradas.html",
            "https://www.unoentrerios.com.ar/secciones/a-un-click.html",
            "https://www.unoentrerios.com.ar/secciones/elpais.html",
            "https://www.unoentrerios.com.ar/secciones/elmundo.html",
            "https://www.unoentrerios.com.ar/secciones/economia.html",
            "https://www.unoentrerios.com.ar/secciones/uno-en-la-calle.html",
            "https://www.unoentrerios.com.ar/secciones/resultado.html",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*-n\d{6,}.html"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.unoentrerios.com.ar/sitemap.xml"]

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
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='//p[contains(@class, "paragraph-date")]',
                exclude_list=[],
            ).split("-")[-1]
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
