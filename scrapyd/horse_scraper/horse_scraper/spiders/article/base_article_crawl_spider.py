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
from horse_scraper.database.article_db_handler import ArticleDbHandler  # type: ignore
from horse_scraper.spiders.article.base_article_spider_params import (
    BaseArticleSpiderParams,
)


class BaseArticleCrawlSpider(CrawlSpider):

    source_info: ArticleSourceInfo

    params: BaseArticleSpiderParams
    date_span = DateSpan()

    scheduleArgs = SpiderScheduleArgs()

    follow_current_article_links = True

    def __init__(self, *args, **kwargs):
        self.setup_logger()

        # Init date span
        if "period_days_back" in kwargs:
            self.scheduleArgs.period_days_back = int(kwargs["period_days_back"])
        else:
            self.scheduleArgs.period_days_back = CRAWL_PERIOD_DAYS_BACK

        today = date.today()
        self.date_span.from_date_incl = today - timedelta(
            days=self.scheduleArgs.period_days_back
        )
        self.date_span.to_date_incl = today

        # Init params
        self.params.initialize(self.scheduleArgs)

        handler = ArticleDbHandler()
        self.source_info = handler.get_spider_article_source_info(self.name)

        self.allowed_domains = self.params.get_allowed_domains()
        self.start_urls = self.params.get_crawl_start_urls()
        self.rules = self.params.get_crawl_rules()

        super().__init__(self.name, *args, **kwargs)

    def setup_logger(self):
        logger = logging.getLogger()
        hdlr = logging.FileHandler(
            filename=self.name + ".log", encoding=FEED_EXPORT_ENCODING
        )
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
        hdlr.setFormatter(formatter)
        hdlr.setLevel(LOG_LEVEL)
        logger.addHandler(hdlr)

    def process_links(self, links):
        if not self.follow_current_article_links:
            return []

        return links

    def parse_items(self, response: HtmlResponse):
        logging.info("Parsing: " + response.url)
        logging.info("")

        article = Article()

        data, parse_function = self.call_parser_functions(
            response, self.params.get_parser_functions()
        )

        if data is None:
            article["source_id"] = self.source_info.id
            article["url"] = response.url
            article["title"] = None
            article["text"] = None
            article["last_updated"] = None
            article["spider_name"] = self.name
            article["parse_function"] = None
            article["result"] = "error"
            article["error"] = "All parse attempts failed"
            article["error_details"] = ""
            return article

        article["source_id"] = self.source_info.id
        article["url"] = response.url
        article["title"] = data.title
        article["text"] = data.text
        article["last_updated"] = data.last_updated
        article["spider_name"] = self.name
        article["parse_function"] = parse_function
        article["result"] = "success"
        article["error"] = None
        article["error_details"] = None

        is_valid_date = self.is_article_date_inside_search_period(article)
        self.follow_current_article_links = is_valid_date

        if is_valid_date:
            return article

        date_str = article["last_updated"].strftime("%d/%m/%Y")
        logging.info(
            "Article date (" + date_str + ") is outside the search period --> skipping."
        )
        logging.info("")
        return None

    def call_parser_functions(
        self,
        response: HtmlResponse,
        parser_functions: List[Callable[[HtmlResponse], ArticleData]],
    ) -> Tuple[Union[ArticleData, None], Union[str, None]]:

        for f in parser_functions:

            if callable(f) == False:
                raise Exception("Element: '" + str(f) + "' is not callable")

            f_name: str = getattr(f, "__name__", str(f))

            logging.info("Trying to parse using: " + f_name + "...")

            try:
                article_data = f(response)

                if self.is_article_data_valid(article_data):
                    logging.info("--> Success")
                    logging.info("")
                    return article_data, f_name
                else:
                    logging.debug("--> Failed")

            except Exception as e:
                logging.debug("--> Failed")
                logging.debug(str(e))

                exc_type, exc_value, exc_traceback = sys.exc_info()
                for tb in traceback.format_tb(exc_traceback):
                    logging.debug(tb)

                continue

            continue

        logging.error("Could not parse url: " + response.url)
        logging.error("All parse attempts failed")
        logging.info("")

        return None, None

    def is_article_data_valid(self, data: ArticleData) -> bool:
        if isinstance(data, ArticleData) == False:
            raise Exception("Data is not an instance of ArticleData: " + str(data))

        if data.title is None or data.title == "":
            return False

        if data.text is None or data.text == "":
            return False

        if data.last_updated is None:
            return False

        return True

    def is_article_date_inside_search_period(self, article: Article) -> bool:
        article_date = article["last_updated"].date()
        start_search_date = self.date_span.from_date_incl

        if article_date <= start_search_date:
            return False

        return True

    def is_article_already_persisted(self, url: str) -> bool:
        handler = ArticleDbHandler()
        return handler.is_article_already_persisted(url, self.source_info.id)
