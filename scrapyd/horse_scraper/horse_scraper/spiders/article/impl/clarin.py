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
)
from horse_scraper.services.utils.parse_utils import extract_all_text, AttributeType
from ..base_article_crawl_spider import BaseArticleCrawlSpider
from ..base_article_sitemap_spider import BaseArticleSitemapSpider


class Params(BaseArticleSpiderParams):
    def _after_initialize(self) -> None:
        pass

    # Common params
    def _get_spider_base_name(self) -> str:
        return "clarin"

    def get_allowed_domains(self) -> List[str]:
        return ["clarin.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.clarin.com/",
        ]

    def get_crawl_rules(self) -> Tuple[Rule, ...]:
        return (
            Rule(
                callback="parse_items",
                link_extractor=LinkExtractor(
                    allow="_\d+_.+.htm.*", deny=".*fotogalerias.*",
                ),
                process_links="process_links",
                follow=True,
            ),
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.clarin.com/sitemap.xml"]

    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        return [
            (".*fotogalerias.*", None),
            ("_\d+_.+.htm.*", "parse_items"),
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [
            "sitemap_news",
        ]

    def should_parse_sitemap_entry(self, entry: Dict[str, str]) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
            self.parser_2,
            self.parser_3,
        ]

    def parser_1(self, response):

        # title ----------
        title = (
            response.xpath('//meta [@itemprop="headline"]/@content').extract_first()
            + " | "
            + (
                response.xpath(
                    '//div [@itemprop="description"]//h2//text()'
                ).extract_first()
                or ""
            )
        )
        title = title.strip()

        # last_updated ----------
        last_updated = response.xpath(
            '//meta [@name="ageaParse:recs:publishtime"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div [@class="body-nota"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "content-new"),
                (AttributeType.CLASS, "comments"),
                (AttributeType.CLASS, "banner"),
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
        title = html.unescape(script_datos_articulo["headline"])

        if "description" in script_datos_articulo:
            title += " | " + html.unescape(script_datos_articulo["description"])

        title = title.strip()

        # last_updated ----------
        last_updated = response.xpath(
            '//meta [@name="ageaParse:recs:publishtime"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div [@class="body-nota"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "content-new"),
                (AttributeType.CLASS, "comments"),
                (AttributeType.CLASS, "banner"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_3(self, response):

        # title ----------
        title = extract_all_text(
            response, root_xpath='//h1[@id="title"]', exclude_list=[],
        )

        title = title.strip()

        # last_updated ----------
        script = extract_all_text(
            response,
            root_xpath='//script[contains(@type, "text/javascript") and contains(text(), "datePublished")]',
            exclude_list=[],
        )

        match = re.search('"datePublished": "(.*?)"', script)

        last_updated = match.group(1)  # type: ignore

        # The articles parsed by this function happen to have an invalid datePublished value
        # such as i.e.: "2020/04/30 18:30:32 PM". Removing the AM / PM as a workaround.
        last_updated = last_updated.replace("AM", "").replace("PM", "")
        last_updated = dateparser.parse(last_updated)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div [@class="body-nota"]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "content-new"),
                (AttributeType.CLASS, "comments"),
                (AttributeType.CLASS, "banner"),
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
