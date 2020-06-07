import sys
import traceback
import logging
import re
import dateparser  # type: ignore

from typing import Tuple, List, Dict, Iterator, Generator, Union, Callable, cast
from abc import abstractmethod

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import SitemapSpider, Rule  # type: ignore
from scrapy.spiders.sitemap import iterloc  # type: ignore
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
    SITEMAP_PERIOD_DAYS_BACK,
)
from horse_scraper.database.article_db_handler import ArticleDbHandler  # type: ignore

from .base_article_spider import BaseArticleSpider
from .base_article_spider_params import BaseArticleSpiderParams
from .default_article_parser import DefaultArticleParser


class BaseArticleSitemapSpider(BaseArticleSpider, SitemapSpider):
    def __init__(self, *args, **kwargs):

        # Init date span
        if "period_days_back" in kwargs:
            self.scheduleArgs.period_days_back = int(kwargs["period_days_back"])
        else:
            self.scheduleArgs.period_days_back = SITEMAP_PERIOD_DAYS_BACK

        BaseArticleSpider.__init__(self, self.name, *args, **kwargs)

        self.allowed_domains = self.params.get_allowed_domains()
        self.sitemap_urls = self.params.get_sitemap_urls()
        self.sitemap_rules = self.params.get_sitemap_rules()
        self.sitemap_follow = self.params.get_sitemap_follow()

        SitemapSpider.__init__(self, self.name, *args, **kwargs)

    def sitemap_filter(
        self, entries: Iterator[Dict[str, str]]
    ) -> Generator[Dict[str, str], None, None]:

        for entry in entries:

            url: str = entry["loc"]
            is_sitemap_entry = url.endswith(".xml") or url.endswith(".txt")

            # it's sitemap entry --> filter if 'lastmod' info is present and outside search period
            if is_sitemap_entry:

                # 'lastmod' info is missing --> valid entry
                if not "lastmod" in entry:
                    if not self.should_follow_sitemap_url(url):
                        # should not follow --> skip
                        continue
                    logging.info("Exploring sitemap (lastmod=?): " + url)
                    yield entry
                    continue

                # 'lastmod' info is present
                lastmod: datetime = dateparser.parse(entry["lastmod"])

                if not self.is_sitemap_entry_inside_search_period(lastmod):
                    # 'lastmod' is outside search period --> skip
                    continue

                if not self.should_follow_sitemap_url(url):
                    # should not follow --> skip
                    continue

                # 'lastmod' inside search period --> valid entry
                logging.info(f"Exploring sitemap (lastmod={entry['lastmod']}): " + url)
                yield entry
                continue

            # it's not sitemap entry
            else:

                # analyzing article url:
                if not self.should_follow_article_url(url):
                    # should not follow --> skip
                    continue

                if not "lastmod" in entry:
                    # 'lastmod' info missing --> skip
                    continue

                lastmod = dateparser.parse(entry["lastmod"])

                if not self.is_sitemap_entry_inside_search_period(lastmod):
                    # 'lastmod' is outside search period --> skip
                    continue

                if not self.params.should_parse_sitemap_entry(entry):
                    # no valid rules apply --> skip
                    continue

                if self.is_article_already_persisted(url):
                    # already persisted --> skip
                    continue

                logging.info(
                    f"--> Valid url (lastmod={entry['lastmod']}) >>> (parsing article): "
                    + url
                )
                yield entry

    def _parse_sitemap(self, response):
        logging.info("_parse_sitemap: " + response.url)
        is_text_sitemap = response.url.endswith(".txt")

        if not is_text_sitemap:
            yield from super()._parse_sitemap(response)

        else:
            # override for txt format sitemap (one url per line - https://www.sitemaps.org/protocol.html)
            urls = response.text.splitlines()

            entries = map(
                lambda url: {"loc": url, "lastmod": datetime.now().isoformat(),}, urls
            )

            it = self.sitemap_filter(entries)

            for loc in iterloc(it, self.sitemap_alternate_links):
                for r, c in self._cbs:
                    if r.search(loc):
                        yield Request(loc, callback=c)
                        break

    def should_follow_article_url(self, url: str) -> bool:
        for r, c in self._cbs:
            if r.search(url):
                return c is not None
        return False

    def should_follow_sitemap_url(self, url: str) -> bool:
        return self.params.should_follow_sitemap_url(url)

    def is_sitemap_entry_inside_search_period(self, lastmod: datetime) -> bool:
        start_search_date = self.date_span.from_date_incl

        if lastmod.date() <= start_search_date:
            return False

        return True
