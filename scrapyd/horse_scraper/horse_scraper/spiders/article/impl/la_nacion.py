from typing import Tuple, List, Dict, Union, Callable, cast

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
from horse_scraper.services.utils.parse_utils import extract_all_text, AttributeType
from ..base_article_crawl_spider import BaseArticleCrawlSpider
from ..base_article_sitemap_spider import BaseArticleSitemapSpider


class Params(BaseArticleSpiderParams):
    def _after_initialize(self) -> None:
        pass

    # Common params
    def _get_spider_base_name(self) -> str:
        return "la_nacion"

    def get_allowed_domains(self) -> List[str]:
        return ["lanacion.com.ar"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lanacion.com.ar/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*nid\d+"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.lanacion.com.ar/sitemap.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return [".*"]

    def should_parse_sitemap_entry(self, entry: Dict[str, str]) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        # notas-YYYY
        s = re.search("\/notas-(\d{4})-", url)
        if s and int(s.group(1)) < 2019:
            return False

        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
            self.parser_2,
        ]

    def parser_1(self, response):

        # Datos artículo (json) ----------
        script_datos_articulo_json = response.xpath(
            '//script [@id="Schema_NewsArticle"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)

        # title ----------
        title = html.unescape(script_datos_articulo["headline"])
        title = title.strip()

        # last_updated ----------
        last_updated = response.xpath(
            '//meta [@property="article:published_time"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//article[@id="nota"]//section[@id="cuerpo"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "datos-nota"),
                (AttributeType.CLASS, "ademas"),
                (AttributeType.CLASS, "fin-nota"),
                (AttributeType.CLASS, "link-boton"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        # title ----------
        title = response.xpath('//meta [@property="og:title"]/@content').extract_first()
        title = title.strip()

        # last_updated ----------
        last_updated = response.xpath(
            '//meta [@property="article:published_time"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[@class="scrollContent"]',
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
