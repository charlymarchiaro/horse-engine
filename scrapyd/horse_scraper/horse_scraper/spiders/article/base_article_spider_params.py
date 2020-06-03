import sys
import traceback
import logging
import re
import json
import dateparser  # type: ignore

from datetime import datetime, date, timedelta
from string import whitespace

from typing import Tuple, List, Dict, Union, Callable, cast
from abc import abstractmethod

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import Rule  # type: ignore
from scrapy.utils.log import configure_logging  # type: ignore

from horse_scraper.items import Article
from horse_scraper.spiders.article.model import (
    ArticleData,
    SpiderType,
    SpiderScheduleArgs,
)
from horse_scraper.settings import (
    LOG_LEVEL,
    FEED_EXPORT_ENCODING,
)
from horse_scraper.database.article_db_handler import ArticleDbHandler  # type: ignore


class BaseArticleSpiderParams:

    scheduleArgs: SpiderScheduleArgs

    def __init__(self, *args, **kwargs):
        pass

    def initialize(self, scheduleArgs: SpiderScheduleArgs):
        self.scheduleArgs = scheduleArgs
        logging.info("Schedule args:")
        logging.info("--> period_days_back=" + str(self.scheduleArgs.period_days_back))
        logging.info("")

        self._after_initialize()

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

    # Crawl params
    @abstractmethod
    def get_crawl_start_urls(self) -> List[str]:
        pass

    @abstractmethod
    def get_crawl_rules(self) -> Tuple[Rule, ...]:
        pass

    # Sitemap params
    @abstractmethod
    def get_sitemap_urls(self) -> List[str]:
        pass

    @abstractmethod
    def get_sitemap_rules(self) -> List[Tuple[str, Union[str, None]]]:
        pass

    @abstractmethod
    def get_sitemap_follow(self) -> List[str]:
        pass

    @abstractmethod
    def should_parse_sitemap_entry(self, entry: Dict[str, str]) -> bool:
        pass

    @abstractmethod
    def should_follow_sitemap_url(self, url:str) -> bool:
        pass

    # Parser functions
    @abstractmethod
    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        pass
