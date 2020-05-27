from typing import Tuple, List, Dict, Union, Callable, cast

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
)
from horse_scraper.services.utils.parse_utils import extract_all_text, AttributeType


class CronistaParams(BaseArticleSpiderParams):

    date_allow_str: str

    def _after_initialize(self) -> None:
        today = date.today()

        date_strings = []

        for days in range(self.scheduleArgs.period_days_back):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, "04")
            day = format(search_date.day, "02")
            month = format(search_date.month, "02")

            date_strings.append(year + month + day)
            self.date_allow_str = "|".join(date_strings)

    # Common params
    def _get_spider_base_name(self) -> str:
        return "cronista"

    def get_source_name(self) -> str:
        return "Cronista"

    def get_allowed_domains(self) -> List[str]:
        return ["cronista.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.cronista.com/",
        ]

    def get_crawl_rules(self) -> Tuple[Rule, ...]:
        return (
            Rule(
                callback="parse_items",
                link_extractor=LinkExtractor(
                    allow="(" + self.date_allow_str + ").*htm.*", deny=".*\/-ve\d+.html"
                ),
                process_links="process_links",
                follow=True,
            ),
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.cronista.com/sitemaps/v3/sitemaps-index.xml",
            "https://www.cronista.com/sitemaps/v3/news-daily-apertura.xml",
            "https://www.cronista.com/sitemaps/v3/news-daily-clase.xml",
            "https://www.cronista.com/sitemaps/v3/news-daily-cronista.xml",
            "https://www.cronista.com/sitemaps/v3/news-daily-pyme.xml",
            "https://www.cronista.com/sitemaps/v3/news-daily-rpm.xml",
            "https://www.cronista.com/sitemaps/v3/gnews-cronista.xml",
        ]

    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        return [
            (".*\/-ve\d+.html", None),
            ("(" + self.date_allow_str + ").*htm.*", "parse_items"),
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [".*"]

    def should_parse_sitemap_entry(self, entry: Dict[str, str]) -> bool:
        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
            self.parser_2,
            self.parser_3,
        ]

    def parser_1(self, response):

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
    def parser_3(self, response):

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
        last_updated = datetime.now()

        # text ----------
        text = "Nota Video"

        return ArticleData(title, text, last_updated)
