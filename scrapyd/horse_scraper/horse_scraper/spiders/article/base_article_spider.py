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
)
from horse_scraper.database.article_db_handler import ArticleDbHandler
from .base_article_spider_params import BaseArticleSpiderParams
from .default_article_parser import DefaultArticleParser


class BaseArticleSpider:

    name: str
    source_info: ArticleSourceInfo

    params: BaseArticleSpiderParams
    date_span = DateSpan()

    schedule_args = SpiderScheduleArgs()

    # Default parser
    default_parser = DefaultArticleParser()

    start_time: datetime

    def __init__(self, name: str, *args, **kwargs):
        self.setup_logger()
        self.init_date_span()
        self.init_source_info()
        self.init_params()

        self.start_time = datetime.now()

    def setup_logger(self):
        logger = logging.getLogger()
        hdlr = logging.FileHandler(
            filename=self.name + ".log", encoding=FEED_EXPORT_ENCODING
        )
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
        hdlr.setFormatter(formatter)
        hdlr.setLevel(LOG_LEVEL)
        logger.addHandler(hdlr)

    def init_date_span(self):
        today = date.today()
        self.date_span.from_date_incl = today - timedelta(
            days=self.schedule_args.period_days_back
        )
        self.date_span.to_date_incl = today

    def init_params(self):
        self.params.initialize(
            self.schedule_args, self.date_span, self.source_info, self.default_parser
        )

    def init_source_info(self):
        handler = ArticleDbHandler()
        self.source_info = handler.get_spider_article_source_info(self.name)

    def parse_items(self, response: HtmlResponse):
        logging.info("Parsing: " + response.url)
        logging.info("")

        article = Article()

        article_date, data, parse_function = self.call_parser_functions(
            response, self.params.get_parser_functions()
        )

        # The article date is outside the search period --> skip
        if article_date and not self.is_article_date_inside_search_period(article_date):
            date_str = article_date.strftime("%d/%m/%Y")
            logging.info(
                "Article date ("
                + date_str
                + ") is outside the search period --> skipping."
            )
            logging.info("")

            return None

        # Data is not valid
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

        return article

    # Returns: article_date, article_data, f_name
    def call_parser_functions(
        self,
        response: HtmlResponse,
        parser_functions: List[Callable[[HtmlResponse], ArticleData]],
    ) -> Tuple[Union[datetime, None], Union[ArticleData, None], Union[str, None]]:

        article_date: Union[datetime, None]

        for f in parser_functions:

            if callable(f) == False:
                raise Exception("Element: '" + str(f) + "' is not callable")

            f_name = getattr(f, "__name__", str(f))
            logging.info("Trying to parse using: " + f_name + "...")

            try:
                article_data = f(response)

                if self.is_article_data_valid(article_data):
                    logging.info("--> Success")
                    logging.info("")
                    article_date = article_data.last_updated
                    return article_date, article_data, f_name
                else:
                    logging.debug("--> Failed")
                    if article_data.last_updated:
                        article_date = article_data.last_updated

            except Exception as e:
                logging.debug("--> Failed")
                logging.debug(str(e))

                exc_type, exc_value, exc_traceback = sys.exc_info()
                for tb in traceback.format_tb(exc_traceback):
                    logging.debug(tb)

                continue

            continue

        # Try default parser

        f_name = "default_parser"
        logging.info("Trying to parse using: " + f_name + "...")

        try:
            article_data = self.default_parser.parse(
                response, self.date_span, self.source_info
            )

            if self.is_article_data_valid(article_data):
                logging.info("--> Success")
                logging.info("")
                article_date = article_data.last_updated
                return article_date, article_data, f_name
            else:
                logging.debug("--> Failed")
                if article_data.last_updated:
                    article_date = article_data.last_updated

        except Exception as e:
            logging.debug("--> Failed")
            logging.debug(str(e))

            exc_type, exc_value, exc_traceback = sys.exc_info()
            for tb in traceback.format_tb(exc_traceback):
                logging.debug(tb)

        logging.error("Could not parse url: " + response.url)
        logging.error("All parse attempts failed")
        logging.info("")

        return article_date, None, None

    def is_article_data_valid(self, data: ArticleData) -> bool:
        if isinstance(data, ArticleData) == False:
            raise Exception("Data is not an instance of ArticleData: " + str(data))

        is_valid = True

        if data.title is None or data.title == "":
            logging.info("--> Article data is invalid: empty title")
            is_valid = False

        if data.text is None or data.text == "":
            logging.info("--> Article data is invalid: empty text")
            is_valid = False

        if data.last_updated is None:
            logging.info("--> Article data is invalid: empty last_updated")
            is_valid = False

        return is_valid

    def is_article_date_inside_search_period(self, article_date: datetime) -> bool:
        start_search_date = self.date_span.from_date_incl

        if article_date.date() <= start_search_date:
            return False

        return True

    def get_current_run_time_hours(self) -> float:
        return (datetime.now() - self.start_time).total_seconds() / 3600
