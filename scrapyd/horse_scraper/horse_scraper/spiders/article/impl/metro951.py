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
from ..base_article_crawl_spider import BaseArticleCrawlSpider
from ..base_article_sitemap_spider import BaseArticleSitemapSpider


class Metro951Params(BaseArticleSpiderParams):

    date_allow_str: str

    def _after_initialize(self) -> None:
        today = date.today()

        date_strings = []

        for days in range(self.scheduleArgs.period_days_back):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, "04")
            month = format(search_date.month, "02")

            date_strings.append("/" + year + "/" + month + "/")
            self.date_allow_str = "|".join(date_strings)

    # Common params
    def _get_spider_base_name(self) -> str:
        return "metro951"

    def get_allowed_domains(self) -> List[str]:
        return ["metro951.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.metro951.com/?s=%22%22&orderby=date&order=DESC",
        ]

    def get_crawl_rules(self) -> Tuple[Rule, ...]:
        return (
            Rule(
                callback="parse_items",
                link_extractor=LinkExtractor(
                    allow=".*(" + self.date_allow_str + ").*",
                ),
                process_links="process_links",
                follow=True,
            ),
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.metro951.com/sitemap.xml"]

    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        return [
            (".*(" + self.date_allow_str + ").+/", "parse_items"),
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [".*"]

    def should_parse_sitemap_entry(self, entry: Dict[str, str]) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
        ]

    def parser_1(self, response):

        # Datos artículo (json) ----------
        script_datos_articulo_json = response.xpath(
            '//script [@class="aioseop-schema"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)["@graph"]

        # title ----------
        if "description" in script_datos_articulo[2]:
            description = script_datos_articulo[2]["description"]
        else:
            description = ""

        title = (
            html.unescape(script_datos_articulo[3]["headline"])
            + " | "
            + html.unescape(description)
        )
        title = title.strip()

        # last_updated ----------
        last_updated = script_datos_articulo[3]["dateModified"]
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "singlePost__content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "close"),
            ],
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class Metro951CrawlSpider(BaseArticleCrawlSpider):
    params = Metro951Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class Metro951SitemapSpider(BaseArticleSitemapSpider):
    params = Metro951Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
