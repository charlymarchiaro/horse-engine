import sys
import traceback
import logging
import re
import dateparser  # type: ignore

from typing import Tuple, List, Union, Callable, cast
from abc import abstractmethod

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import CrawlSpider, Rule  # type: ignore
from scrapy.utils.log import configure_logging  # type: ignore

from datetime import datetime, date, timedelta
from string import whitespace

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
    CRAWL_PERIOD_DAYS_BACK,
)
from horse_scraper.database.article_db_handler import ArticleDbHandler

from .base_article_spider import BaseArticleSpider
from .base_article_spider_params import BaseArticleSpiderParams
from .default_article_parser import DefaultArticleParser


class BaseArticleCrawlSpider(BaseArticleSpider, CrawlSpider):

    follow_current_article_links = True

    def __init__(self, *args, **kwargs):

        # Init date span
        if "period_days_back" in kwargs:
            self.scheduleArgs.period_days_back = int(kwargs["period_days_back"])
        else:
            self.scheduleArgs.period_days_back = CRAWL_PERIOD_DAYS_BACK

        BaseArticleSpider.__init__(self, self.name, *args, **kwargs)

        self.allowed_domains = self.params.get_allowed_domains()
        self.start_urls = self.params.get_crawl_start_urls()
        self.rules = self.params.get_crawl_rules()

        CrawlSpider.__init__(self, self.name, *args, **kwargs)

    def process_links(self, links):
        if not self.follow_current_article_links:
            return []

        return links
