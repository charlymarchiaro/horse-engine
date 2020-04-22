import scrapy
import sys
import traceback
import logging
import re
import dateparser

from abc import abstractmethod
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import SitemapSpider, Rule
from scrapy.spiders.sitemap import iterloc
from scrapy.utils.log import configure_logging
from scrapy import Request

from datetime import datetime, date, timedelta
from string import whitespace

from scraper.horse_scraper.items import Article
from scraper.horse_scraper.settings import LOG_LEVEL, FEED_EXPORT_ENCODING, SITEMAP_PERIOD_DAYS_BACK
from scraper.horse_scraper.database.article_db_handler import ArticleDbHandler


class ArticleData(scrapy.Item):
    title = scrapy.Field()
    text = scrapy.Field()
    last_updated = scrapy.Field()


class BaseArticleSitemapSpider(SitemapSpider):

    source_name = ''

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

    @abstractmethod
    def get_parser_functions(self):
        pass

    @abstractmethod
    def should_parse_sitemap_entry(self, entry):
        pass

    def sitemap_filter(self, entries):

        for entry in entries:

            url = entry['loc']
            is_sitemap_entry = url.endswith('.xml') or url.endswith('.txt')

            # it's sitemap entry --> filter if 'lastmod' info is present and outside search period
            if(is_sitemap_entry):

                # 'lastmod' info is missing --> valid entry
                if not 'lastmod' in entry:
                    logging.info('Exploring sitemap (lastmod=?): ' + url)
                    yield entry
                    continue

                # 'lastmod' info is present
                lastmod = dateparser.parse(entry['lastmod'])

                if not self.is_sitemap_entry_inside_search_period(lastmod):
                    # 'lastmod' is outside search period --> skip
                    continue

                # 'lastmod' inside search period --> valid entry
                logging.info(
                    f"Exploring sitemap (lastmod={entry['lastmod']}): " + url)
                yield entry
                continue

            # it's not sitemap entry
            # analyzing article url:
            if not self.should_follow_article_url(url):
                # should not follow --> skip
                continue

            if not 'lastmod' in entry:
                # 'lastmod' info missing --> skip
                continue

            lastmod = dateparser.parse(entry['lastmod'])

            if not self.is_sitemap_entry_inside_search_period(lastmod):
                # 'lastmod' is outside search period --> skip
                continue

            if not self.should_parse_sitemap_entry(entry):
                # no valid rules apply --> skip
                continue

            if self.is_article_already_persisted(url):
                # already persisted --> skip
                continue

            logging.info(
                f"--> Valid url (lastmod={entry['lastmod']}) >>> (parsing article): " + url)
            yield entry

    def _parse_sitemap(self, response):
        is_text_sitemap = response.url.endswith('.txt')

        if(not is_text_sitemap):
            yield from super()._parse_sitemap(response)

        else:
            # override for txt format sitemap (one url per line - https://www.sitemaps.org/protocol.html)
            urls = response.text.splitlines()

            entries = map(
                lambda url: {
                    'loc': url,
                    'lastmod': datetime.now().isoformat(),
                },
                urls
            )

            it = self.sitemap_filter(entries)

            for loc in iterloc(it, self.sitemap_alternate_links):
                for r, c in self._cbs:
                    if r.search(loc):
                        yield Request(loc, callback=c)
                        break

    def should_follow_article_url(self, url):
        for r, c in self._cbs:
            if r.search(url):
                return c is not None
        return False

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

    def is_article_data_valid(self, data) -> bool:
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

    def is_sitemap_entry_inside_search_period(self, lastmod) -> bool:
        today = date.today()
        start_search_date = today - timedelta(days=SITEMAP_PERIOD_DAYS_BACK)

        if(lastmod.date() <= start_search_date):
            return False

        return True

    def is_article_date_inside_search_period(self, article) -> bool:
        article_date = article['last_updated'].date()
        today = date.today()
        start_search_date = today - timedelta(days=SITEMAP_PERIOD_DAYS_BACK)

        if(article_date <= start_search_date):
            return False

        return True

    def is_article_already_persisted(self, url) -> bool:
        handler = ArticleDbHandler()
        return handler.is_article_already_persisted(url)
