import sys
import traceback
import logging
import re
import json
import dateparser  # type: ignore

from datetime import datetime, date, timedelta
from string import whitespace

from typing import Tuple, List, Dict, Any, Union, Callable, cast
from abc import abstractmethod

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import Rule  # type: ignore
from scrapy.utils.log import configure_logging  # type: ignore

from horse_scraper.items import Article
from horse_scraper.spiders.article.model import (
    ArticleSourceInfo,
    ArticleData,
    SpiderType,
    SpiderScheduleArgs,
    DateSpan,
)
from horse_scraper.settings import (
    LOG_LEVEL,
    FEED_EXPORT_ENCODING,
)
from horse_scraper.database.article_db_handler import ArticleDbHandler
from horse_scraper.services.utils.parse_utils import (
    sanitize_date_str as parse_utils_sanitize_date_str,
)
from .default_article_parser import DefaultArticleParser, get_locale_date_order


class UrlFilter:
    allow_re: List[str]
    deny_re: List[str]

    def __init__(self, allow_re: List[str], deny_re: List[str]):
        self.allow_re = allow_re
        self.deny_re = deny_re


class BaseArticleSpiderParams:

    schedule_args: SpiderScheduleArgs
    date_span: DateSpan
    source_info: ArticleSourceInfo
    default_parser: DefaultArticleParser

    url_filter: UrlFilter

    # Override to keep query string of the article's url
    keep_url_query_string: bool = False

    # Override to ignore missing sitemap entry dates
    ignore_missing_sitemap_entry_date: bool = False

    # Override to ignore sitemap termination
    ignore_sitemap_termination: bool = False

    # Override to use Selenium to parse dynamically loaded content
    selenium_enabled: bool = False
    selenium_wait_time: Union[float, None] = None
    selenium_wait_until: Union[Any, None] = None
    selenium_screenshot: bool = False
    selenium_script: Union[str, None] = None

    def __init__(self, *args, **kwargs):
        pass

    def initialize(
        self,
        schedule_args: SpiderScheduleArgs,
        date_span: DateSpan,
        source_info: ArticleSourceInfo,
        default_parser: DefaultArticleParser,
    ):
        self.schedule_args = schedule_args
        self.date_span = date_span
        self.source_info = source_info
        self.default_parser = default_parser

        logging.info("Schedule args:")
        logging.info("--> period_days_back=" + str(self.schedule_args.period_days_back))
        logging.info("")

        self._after_initialize()
        self.url_filter = self.get_url_filter()

    @abstractmethod
    def _after_initialize(self) -> None:
        pass

    # Common params
    @abstractmethod
    def _get_spider_base_name(self) -> str:
        pass

    def get_spider_name(self, spider_type: SpiderType) -> str:

        switcher: Dict[SpiderType, str] = {
            SpiderType.CRAWL: "crawl",
            SpiderType.SITEMAP: "sitemap",
        }

        return self._get_spider_base_name() + "_" + switcher.get(spider_type, "")

    @abstractmethod
    def get_allowed_domains(self) -> List[str]:
        pass

    @abstractmethod
    def get_url_filter(self) -> UrlFilter:
        pass

    # Crawl params
    @abstractmethod
    def get_crawl_start_urls(self) -> List[str]:
        pass

    def get_crawl_rules(self) -> Tuple[Rule, ...]:

        return (
            Rule(
                callback="parse_items",
                link_extractor=LinkExtractor(
                    allow=self.url_filter.allow_re, deny=self.url_filter.deny_re
                ),
                process_links="process_links",
                follow=True,
            ),
        )

    # Sitemap params
    @abstractmethod
    def get_sitemap_urls(self) -> List[str]:
        pass

    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        result: List[Tuple[str, Union[str, None]]] = []
        for rule in self.url_filter.deny_re:
            result.append((rule, None))
        for rule in self.url_filter.allow_re:
            result.append((rule, "parse_items"))

        return result

    @abstractmethod
    def get_sitemap_follow(self) -> List[str]:
        pass

    @abstractmethod
    def should_parse_sitemap_entry(self, entry: Any) -> bool:
        pass

    @abstractmethod
    def should_follow_sitemap_url(self, url: str) -> bool:
        pass

    @abstractmethod
    def should_follow_article_url(self, url: str) -> bool:
        return True

    # Parser functions
    @abstractmethod
    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        pass

    def get_date_allow_str(
        self,
        year_format: str,
        month_format: str,
        day_format: str,
        # year, month, day -> str
        concat_fn: Callable[[str, str, str,], str,],
    ) -> str:
        today = date.today()

        date_strings = []

        for days in range(self.schedule_args.period_days_back):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, year_format)
            month = format(search_date.month, month_format)
            day = format(search_date.day, day_format)

            ds = concat_fn(year, month, day)
            if ds in date_strings:
                continue

            date_strings.append(ds)

        return "|".join(date_strings)

    def get_default_parser_results(self, response: HtmlResponse) -> ArticleData:
        return self.default_parser.parse(
            response, self.date_span, self.source_info, self.selenium_enabled
        )

    def sanitize_date_str(self, date_str: str) -> Union[datetime, None]:
        return parse_utils_sanitize_date_str(
            date_str, None, get_locale_date_order(self.source_info.country)
        )
