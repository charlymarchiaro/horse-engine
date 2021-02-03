from typing import Tuple, List, Dict, Any, Union, Callable, cast

import json
import html
import dateparser  # type: ignore
from datetime import datetime, date, timedelta
from string import whitespace

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
        return "ar__cronista"

    def get_allowed_domains(self) -> List[str]:
        return ["cronista.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.cronista.com/",
            "https://www.cronista.com/economia-politica/",
            "https://www.cronista.com/finanzas-mercados/",
            "https://www.cronista.com/columnistas/",
            "https://www.cronista.com/financial-times/",
            "https://www.cronista.com/internacionales/",
            "https://www.cronista.com/apertura-negocio/",
            "https://www.cronista.com/clase/",
            "https://www.cronista.com/rpm/",
            "https://www.cronista.com/pyme/",
            "https://www.cronista.com/suplemento/transport-cargo/",
            "https://www.cronista.com/suplemento/especiales/",
            "https://www.cronista.com/cronista-global/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f"cronista.com\/.+\/.+\/$"], deny_re=["\/autor\/", "\/tema\/"]
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
            self.parser_2,
            self.parser_3,
            self.parser_4,
        ]

    def parser_1(self, response):
        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[@id="vsmcontent"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "moreinfo"),
                (AttributeType.CLASS, "item"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        # Datos artículo (json) ----------
        script_datos_articulo_json = response.xpath(
            '//script [@id="datosArticulo"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)

        # title ----------
        title = html.unescape(script_datos_articulo["headline"])

        if "description" in script_datos_articulo:
            title += " | " + html.unescape(script_datos_articulo["description"])

        title = title.strip()

        # last_updated ----------
        last_updated = script_datos_articulo["dateModified"]
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//article[@id="nota"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "nota-relacionada"),
                (AttributeType.CLASS, "socialmedia"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_3(self, response):

        # Datos artículo (json) ----------
        script_datos_articulo_json = response.xpath(
            '//script [@id="datosArticulo"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)

        # title ----------
        title = html.unescape(script_datos_articulo["headline"])

        if "description" in script_datos_articulo:
            title += " | " + html.unescape(script_datos_articulo["description"])

        title = title.strip()

        # last_updated ----------
        last_updated = script_datos_articulo["dateModified"]
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//article[@class="container clearfix"][1]//div[@class="content-txt"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "nota-relacionada"),
                (AttributeType.CLASS, "comentarios"),
            ],
        )

        return ArticleData(title, text, last_updated)

    # Nota video
    def parser_4(self, response):

        article_data = self.get_default_parser_results(response)

        # title ----------
        title_tag = response.xpath("//title//text()").extract_first()

        if title_tag != "Nota Video":
            raise Exception("It's not a video article")

        title = (
            response.xpath('//h3 [@itemprop="headline name"]//text()')
            .extract_first()
            .strip()
        )

        # last_updated ----------
        last_updated = article_data.last_updated

        # text ----------
        text = "Nota Video"

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
