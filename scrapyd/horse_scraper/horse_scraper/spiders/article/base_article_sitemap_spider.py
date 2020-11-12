import sys
import traceback
import logging
import re
import json
import dateparser  # type: ignore
from dateutil.parser import parse as dateutil_parse  # type: ignore

from typing import Tuple, List, Dict, Any, Iterator, Generator, Union, Callable, cast
from abc import abstractmethod

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse, XmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import SitemapSpider, Rule  # type: ignore
from scrapy.spiders.sitemap import iterloc  # type: ignore
from scrapy.utils.log import configure_logging  # type: ignore
from scrapy.utils.sitemap import sitemap_urls_from_robots  # type: ignore
from scrapy.utils.gz import gunzip, gzip_magic_number  # type: ignore
from scrapy.exceptions import CloseSpider  # type: ignore

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
    SITEMAP_MAX_RUN_TIME_HOURS,
)
from horse_scraper.database.article_db_handler import ArticleDbHandler
from horse_scraper.services.utils.sitemap import Sitemap

from .base_article_spider import BaseArticleSpider
from .base_article_spider_params import BaseArticleSpiderParams


class BaseArticleSitemapSpider(BaseArticleSpider, SitemapSpider):
    def __init__(self, *args, **kwargs):

        # Init date span
        if "period_days_back" in kwargs:
            self.schedule_args.period_days_back = int(kwargs["period_days_back"])
        else:
            self.schedule_args.period_days_back = SITEMAP_PERIOD_DAYS_BACK

        BaseArticleSpider.__init__(self, self.name, *args, **kwargs)

        self.allowed_domains = self.params.get_allowed_domains()
        self.sitemap_urls = self.params.get_sitemap_urls()
        self.sitemap_rules = self.params.get_sitemap_rules()
        self.sitemap_follow = self.params.get_sitemap_follow()
        self.rss_urls = self.params.get_rss_urls()

        self.db_handler = ArticleDbHandler()

        SitemapSpider.__init__(self, self.name, *args, **kwargs)

    def start_requests(self):
        for url in self.sitemap_urls:
            yield Request(url, self._parse_sitemap)

        for url in self.rss_urls:
            yield Request(url, self._parse_rss)

    def sitemap_filter(self, entries: Any) -> Generator[Any, None, None]:
        # Check if max run time has been exceeded
        self.check_max_run_time()

        # List article (not sitemap) entries, so that to check more
        # efficiently if they are already persisted in the database
        article_entries: List[Any] = []

        for entry in entries:

            url: str = entry["loc"]
            is_sitemap_entry = (
                url.endswith(".xml") or url.endswith(".txt") or "sitemap" in url
            )

            # it's sitemap entry --> filter if 'entry_date' info is present and outside search period
            if is_sitemap_entry:

                entry_date = self.extract_entry_date(entry)
                # 'entry_date' info is missing --> valid entry
                if not entry_date:
                    if not self.should_follow_sitemap_url(url):
                        # should not follow --> skip
                        continue
                    logging.info("Exploring sitemap (entry_date=?): " + url)
                    yield entry
                    continue

                # 'entry_date' info is present

                if not self.is_sitemap_entry_inside_search_period(entry_date):
                    # 'entry_date' is outside search period --> skip
                    continue

                if not self.should_follow_sitemap_url(url):
                    # should not follow --> skip
                    continue

                # 'entry_date' inside search period --> valid entry
                logging.info(f"Exploring sitemap (entry_date={entry_date}): " + url)
                yield entry
                continue

            # it's not sitemap entry
            else:

                # analyzing article url:
                if not self.should_follow_article_url(url):
                    # should not follow --> skip
                    continue

                entry_date = self.extract_entry_date(entry)

                # check if entry_date is inside the search period
                if self.params.ignore_missing_sitemap_entry_date == False:
                    if not entry_date:
                        # 'entry_date' info missing --> skip
                        continue

                    if not self.is_sitemap_entry_inside_search_period(entry_date):
                        # 'entry_date' is outside search period --> skip
                        continue

                if not self.params.should_parse_sitemap_entry(entry):
                    # no valid rules apply --> skip
                    continue

                entry["entry_date"] = entry_date
                article_entries.append(entry)

            continue

        # Process article entries
        if len(article_entries) > 0:
            for entry in self.get_not_already_persisted_entries(article_entries):
                entry_date = entry["entry_date"]
                logging.info(
                    f"--> Valid url (entry_date={entry_date}) >>> (parsing article): "
                    + entry["loc"]
                )
                yield entry

    def extract_entry_date(self, entry: Any) -> Union[datetime, None]:
        if "entry_date" in entry:

            functions = [
                lambda ds: dateutil_parse(ds),
                lambda ds: dateparser.parse(ds),
            ]

            for f in functions:
                try:
                    date = f(entry["entry_date"])
                except (ValueError, OverflowError, AttributeError, TypeError):
                    date = None

                # Parsed OK
                if date:
                    return date

            # Could not parse
            return None

        # No entry_date field
        return None

    def _parse_sitemap(self, response):
        # Check if max run time has been exceeded
        self.check_max_run_time()

        logging.info("_parse_sitemap: " + response.url)

        # robots.txt
        if response.url.endswith("/robots.txt"):
            logging.info("_parse_sitemap: robots.txt")
            for url in sitemap_urls_from_robots(response.text, base_url=response.url):
                yield self.create_request(
                    url=url, callback=self._parse_sitemap, force_normal_request=True
                )

        # text sitemap
        elif response.url.endswith(".txt"):
            # override for txt format sitemap (one url per line - https://www.sitemaps.org/protocol.html)
            urls = response.text.splitlines()

            entries = map(
                lambda url: {"loc": url, "entry_date": datetime.now().isoformat(),},
                urls,
            )

            it = self.sitemap_filter(entries)

            for loc in iterloc(it, self.sitemap_alternate_links):
                for r, c in self._cbs:
                    if r.search(loc):
                        yield self.create_request(url=loc, callback=c)
                        break

        # xml sitemap
        else:
            body = self._get_sitemap_body(response)
            if body is None:
                logging.warning(
                    "Ignoring invalid sitemap: %(response)s",
                    {"response": response},
                    extra={"spider": self},
                )
                return

            s = Sitemap(body)
            it = self.sitemap_filter(s)

            if s.type == "sitemapindex":
                for loc in iterloc(it, self.sitemap_alternate_links):
                    if any(x.search(loc) for x in self._follow):
                        yield self.create_request(
                            url=loc,
                            callback=self._parse_sitemap,
                            force_normal_request=True,
                        )
            elif s.type == "urlset":
                for loc in iterloc(it, self.sitemap_alternate_links):
                    for r, c in self._cbs:
                        if r.search(loc):
                            yield self.create_request(url=loc, callback=c)
                            break
            else:
                logging.warning("_parse_sitemap: invalid type: " + s.type)

    def _get_sitemap_body(self, response):
        """Return the sitemap body contained in the given response,
        or None if the response is not a sitemap.
        """
        if isinstance(response, XmlResponse):
            return response.body
        elif gzip_magic_number(response):
            return gunzip(response.body)
        # actual gzipped sitemap files are decompressed above ;
        # if we are here (response body is not gzipped)
        # and have a response for .xml.gz,
        # it usually means that it was already gunzipped
        # by HttpCompression middleware,
        # the HTTP response being sent with "Content-Encoding: gzip"
        # without actually being a .xml.gz file in the first place,
        # merely XML gzip-compressed on the fly,
        # in other word, here, we have plain XML
        if self.params.ignore_sitemap_termination:
            return response.body

        elif response.url.endswith(".xml") or response.url.endswith(".xml.gz"):
            return response.body

    def rss_filter(self, entries: Any) -> Generator[Any, None, None]:
        # Check if max run time has been exceeded
        self.check_max_run_time()

        # List article entries, so that to check more efficiently
        # if they are already persisted in the database
        article_entries: List[Any] = []

        for entry in entries:
            url = entry.xpath("link//text()").extract_first()
            date_str = entry.xpath("pubDate//text()").extract_first()
            if url is None or date_str is None:
                continue

            entry_date = dateutil_parse(date_str)

            # analyzing article url:
            if not self.should_follow_article_url(url):
                # should not follow --> skip
                continue

            # check if entry_date is inside the search period
            if not self.is_sitemap_entry_inside_search_period(entry_date):
                # 'entry_date' is outside search period --> skip
                continue

            if not self.params.should_parse_rss_entry(entry):
                # no valid rules apply --> skip
                continue

            article_entries.append({"loc": url, "entry_date": entry_date})

            continue

        # Process article entries
        if len(article_entries) > 0:
            for entry in self.get_not_already_persisted_entries(article_entries):
                entry_date = entry["entry_date"]
                logging.info(
                    f"--> Valid url (entry_date={entry_date}) >>> (parsing article): "
                    + entry["loc"]
                )
                yield entry

    def _parse_rss(self, response):
        # Check if max run time has been exceeded
        self.check_max_run_time()

        logging.info("_parse_rss: " + response.url)

        html = response.text

        # remove CDATA
        html = html.replace("<![CDATA[", "").replace("]]>", "")
        # normalize pubDate
        html = html.replace("pubdate", "pubDate")

        response = response.replace(body=html)

        it = self.rss_filter(response.xpath("//channel/item"))

        for item in it:

            url = item["loc"]

            for r, c in self._cbs:
                if r.search(url):
                    yield self.create_request(url=url, callback=c)
                    break

    def should_follow_article_url(self, url: str) -> bool:
        # Check if max run time has been exceeded
        self.check_max_run_time()

        for r in self.params.url_filter.deny_re:
            if re.search(r, url):
                return False
        for r in self.params.url_filter.allow_re:
            if re.search(r, url):
                return self.params.should_follow_article_url(url)
        return False

    def should_follow_sitemap_url(self, url: str) -> bool:
        # Check if max run time has been exceeded
        self.check_max_run_time()

        return self.params.should_follow_sitemap_url(url)

    def is_sitemap_entry_inside_search_period(self, entry_date: datetime) -> bool:
        start_search_date = self.date_span.from_date_incl

        if entry_date.date() <= start_search_date:
            return False

        return True

    def get_not_already_persisted_entries(self, entries: List[Any]) -> List[Any]:
        persisted_urls = self.db_handler.get_already_persisted_articles(
            urls=list(map(lambda e: str(e["loc"]), entries)),
            article_source_id=self.source_info.id,
            keep_query_string=self.params.keep_url_query_string,
        )

        result: List[Any] = []

        for entry in entries:
            if entry["loc"] in persisted_urls:
                continue

            result.append(entry)

        return result

    def check_max_run_time(self):
        if self.get_current_run_time_hours() > SITEMAP_MAX_RUN_TIME_HOURS:
            raise CloseSpider("Max run time exceeded")
