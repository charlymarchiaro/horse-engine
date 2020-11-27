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
            month_format="02",
            day_format="02",
            concat_fn=lambda year, month, day: f"{year}{month}{day}",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "es__abc"

    def get_allowed_domains(self) -> List[str]:
        return ["abc.es"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.abc.es/",
            "https://www.abc.es/espana/",
            "https://sevilla.abc.es/andalucia/",
            "https://www.abc.es/internacional/",
            "https://www.abc.es/economia/",
            "https://www.abc.es/sociedad/",
            "https://www.abc.es/familia/",
            "https://www.abc.es/opinion/",
            "https://www.abc.es/deportes/",
            "https://www.abc.es/estilo/",
            "https://www.abc.es/cibeles-fashion-week/",
            "https://www.abc.es/cultura/",
            "https://www.abc.es/ciencia/",
            "https://www.abc.es/historia/",
            "https://www.abc.es/viajar/",
            "https://www.abc.es/play/",
            "https://www.abc.es/bienestar/",
            "https://www.abc.es/archivo/",
            "https://www.abc.es/summum/",
            "https://www.abc.es/tecnologia/",
            "https://www.abc.es/salud/",
            "https://www.abc.es/motor/",
            "https://www.abc.es/natural/",
            "https://www.abc.es/recreo/",
            "https://www.abc.es/multimedia/",
            "https://www.abc.es/voz/",
            "https://www.abc.es/ultimas-noticias/",
            "https://www.abc.es/pasatiempos/",
            "https://www.abc.es/servicios/",
            "https://www.abc.es/traductor/",
            "https://www.abc.es/juegos/",
            "https://www.abc.es/gasolineras/",
            "https://www.abc.es/loterias/",
            "https://www.abc.es/concurso/",
            "https://www.abc.es/eltiempo/",
            "https://www.abc.es/esquelas/",
            "https://www.abc.es/oferta-del-dia/",
            "https://www.abc.es/humor/",
            "https://www.abc.es/contacto/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str})\d+_.*html"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.abc.es/sitemap.xml"]

    def get_rss_urls(self) -> List[str]:
        return [
            "https://static1.abc.es/rss/feeds/abc_portada.xml",
            "https://static4.abc.es/rss/feeds/abc_ultima.xml",
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

        # last_updated ----------
        published_time_xpath = response.xpath(
            '//meta[@property="article:published_time"]/@content'
        ).extract()
        published_time_str = (
            published_time_xpath[0] if len(published_time_xpath) > 0 else None
        )

        modified_time_xpath = response.xpath(
            '//meta[@property="article:modified_time"]/@content'
        ).extract()
        modified_time_str = (
            modified_time_xpath[0] if len(modified_time_xpath) > 0 else None
        )

        # Attempt to use modified_time (if present), published_time is frecuently incorrect
        time_str = modified_time_str or published_time_str or None

        last_updated = (
            dateparser.parse(time_str) if time_str else article_data.last_updated
        )

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//span[contains(@class,"cuerpo-texto")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "comentarios"),
                (AttributeType.CLASS, "guardar"),
                (AttributeType.CLASS, "herramientas"),
                (AttributeType.CLASS, "relacionadas"),
                (AttributeType.CLASS, "suscripcion"),
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
