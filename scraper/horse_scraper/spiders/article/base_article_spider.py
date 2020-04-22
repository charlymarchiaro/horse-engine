import scrapy
import sys
import traceback
import logging
import re
import dateparser

from abc import abstractmethod
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from scrapy.utils.log import configure_logging
from scraper.horse_scraper.items import Article
from datetime import datetime, date, timedelta
from string import whitespace

from scraper.horse_scraper.settings import LOG_LEVEL, FEED_EXPORT_ENCODING, SEARCH_PERIOD_DAYS_BACK
from scraper.horse_scraper.database.article_db_handler import ArticleDbHandler


class ArticleData(scrapy.Item):
    title = scrapy.Field()
    text = scrapy.Field()
    last_updated = scrapy.Field()


class BaseArticleSpider(CrawlSpider):

    source_name = ''

    follow_current_article_links = True

    def __init__(self, *args, **kwargs):
        self.setup_logger()
        super().__init__(self.name, *args, **kwargs)

    def setup_logger(self):
        logger = logging.getLogger()
        hdlr = logging.FileHandler(
            filename='../log/' + self.name + '.log',
            encoding=FEED_EXPORT_ENCODING
        )
        formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        hdlr.setFormatter(formatter)
        hdlr.setLevel(LOG_LEVEL)
        logger.addHandler(hdlr)

    def process_links(self, links):
        if(not self.follow_current_article_links):
            return []

        return links

    @abstractmethod
    def get_parser_functions(self):
        pass

    def parse_items(self, response):
        logging.info('Parsing: ' + response.url)
        logging.info('')

        article = Article()

        data, parse_function = self.call_parser_functions(
            response,
            self.get_parser_functions()
        )

        if data is None:
            article['source_name'] = self.source_name
            article['url'] = response.url
            article['title'] = None
            article['text'] = None
            article['last_updated'] = None
            article['spider_name'] = self.name
            article['parse_function'] = None
            article['result'] = 'error'
            article['error'] = 'All parse attempts failed'
            article['error_details'] = ''
            return article

        article['source_name'] = self.source_name
        article['url'] = response.url
        article['title'] = data['title']
        article['text'] = data['text']
        article['last_updated'] = data['last_updated']
        article['spider_name'] = self.name
        article['parse_function'] = parse_function
        article['result'] = 'success'
        article['error'] = None
        article['error_details'] = None

        is_valid_date = self.is_article_date_inside_search_period(article)
        self.follow_current_article_links = is_valid_date

        if(is_valid_date):
            return article

        date_str = article['last_updated'].strftime('%d/%m/%Y')
        logging.info(
            'Article date ('
            + date_str
            + ') is outside the search period --> skipping.')
        logging.info('')
        return None

    def call_parser_functions(self, response, parser_functions) -> [ArticleData, str]:

        for f in parser_functions:

            if callable(f) == False:
                raise Exception("Element: '" + str(f) + "' is not callable")

            f_name = getattr(f, '__name__', str(f))

            logging.info('Trying to parse using: ' + f_name + '...')

            try:
                article_data = f(response)

                if(self.is_article_data_valid(article_data)):
                    logging.info('--> Success')
                    logging.info('')
                    return article_data, f_name
                else:
                    logging.debug('--> Failed')

            except Exception as e:
                logging.debug('--> Failed')
                logging.debug(str(e))

                exc_type, exc_value, exc_traceback = sys.exc_info()
                for tb in traceback.format_tb(exc_traceback):
                    logging.debug(tb)

                continue

            continue

        logging.error('Could not parse url: ' + response.url)
        logging.error('All parse attempts failed')
        logging.info('')

        return None, None

    def is_article_data_valid(self, data):
        if isinstance(data, ArticleData) == False:
            raise Exception(
                "Data is not an instance of ArticleData: " + str(data)
            )

        if data['title'] is None or data['title'] == '':
            return False

        if data['text'] is None or data['text'] == '':
            return False

        if data['last_updated'] is None:
            return False

        return True

    def is_article_date_inside_search_period(self, article):
        article_date = article['last_updated'].date()
        today = date.today()
        start_search_date = today - timedelta(days=SEARCH_PERIOD_DAYS_BACK)

        if(article_date <= start_search_date):
            return False

        return True

    def is_article_already_persisted(self, url):
        handler = ArticleDbHandler()
        return handler.is_article_already_persisted(url)
