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
from horse_scraper.services.utils.parse_utils import (
    extract_all_text,
    AttributeType,
    get_publishing_date,
)
from ..base_article_crawl_spider import BaseArticleCrawlSpider
from ..base_article_sitemap_spider import BaseArticleSitemapSpider


class Params(BaseArticleSpiderParams):
    def _after_initialize(self) -> None:
        today = date.today()

        date_strings = []

        for days in range(self.schedule_args.period_days_back):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, "04")
            day = format(search_date.day, "1")
            month = format(search_date.month, "1")

            date_strings.append("/" + year + "/" + month + "/" + day + "/")

        self.date_allow_str = "|".join(date_strings)

    # Common params
    def _get_spider_base_name(self) -> str:
        return "mdz"

    def get_allowed_domains(self) -> List[str]:
        return ["mdzol.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.mdzol.com/",
        ]

    def get_crawl_rules(self) -> Tuple[Rule, ...]:
        return (
            Rule(
                callback="parse_items",
                link_extractor=LinkExtractor(
                    allow=f".*({self.date_allow_str})?\d+.htm",
                ),
                process_links="process_links",
                follow=True,
            ),
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.mdzol.com/include/sitemaps/"]

    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        return [
            (f".*({self.date_allow_str})?\d+.htm", "parse_items"),
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

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        print(article_data.text)

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div [@class="newsfull__content"]',
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
