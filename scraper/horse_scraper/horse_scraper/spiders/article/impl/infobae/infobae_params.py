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
from horse_scraper.settings import CRAWL_PERIOD_DAYS_BACK
from horse_scraper.services.utils.parse_utils import extract_all_text, AttributeType


class InfobaeParams(BaseArticleSpiderParams):

    date_allow_str: str

    def __init__(self, *args, **kwargs):
        today = date.today()

        date_strings = []

        for days in range(CRAWL_PERIOD_DAYS_BACK):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, "04")
            day = format(search_date.day, "02")
            month = format(search_date.month, "02")

            date_strings.append("/" + year + "/" + month + "/" + day + "/")
            self.date_allow_str = "|".join(date_strings)

        super().__init__(*args, **kwargs)

    # Common params
    def _get_spider_base_name(self) -> str:
        return "infobae"

    def get_source_name(self) -> str:
        return "Infobae"

    def get_allowed_domains(self) -> List[str]:
        return ["infobae.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.infobae.com/",
            "https://www.infobae.com/ultimas-noticias/",
        ]

    def get_crawl_rules(self) -> Tuple[Rule, ...]:
        return (
            Rule(
                callback="parse_items",
                link_extractor=LinkExtractor(
                    allow=".*(" + self.date_allow_str + ").*", deny=".*(/fotos/)",
                ),
                process_links="process_links",
                follow=True,
            ),
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.infobae.com/sitemap-index.xml"]

    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        return [
            (".*(/fotos/)", None),
            (".*(" + self.date_allow_str + ").*", "parse_items"),
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
        ]

    def parser_1(self, response):

        # title ----------
        title = (
            response.xpath("//h1//text()").extract_first()
            + " | "
            + (
                response.xpath('//span [@class="subheadline"]//text()').extract_first()
                or ""
            )
        )
        title = title.strip()

        # last_updated ----------
        last_updated = response.xpath(
            '//meta [@itemprop="pubdate"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[@id="article-content"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        # Datos artículo (json) ----------
        script_datos_articulo_json = response.xpath(
            '//script [@type="application/ld+json"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)

        # title ----------
        if "description" in script_datos_articulo:
            description = script_datos_articulo["description"]
        else:
            description = ""

        title = (
            html.unescape(script_datos_articulo["headline"])
            + " | "
            + html.unescape(description)
        )
        title = title.strip()

        # last_updated ----------
        last_updated = script_datos_articulo["dateModified"]
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//article[contains(@class, "article")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "share_button"),
                (AttributeType.CLASS, "feed-list"),
                (AttributeType.TEXT_EQUALS, "ÚLTIMAS NOTICIAS"),
            ],
        )

        return ArticleData(title, text, last_updated)
