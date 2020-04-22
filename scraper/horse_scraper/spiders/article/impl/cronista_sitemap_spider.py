import scrapy
import re
import dateparser
import json
import html

from scraper.horse_scraper.spiders.article.base_article_sitemap_spider import BaseArticleSitemapSpider, ArticleData
from scraper.horse_scraper.settings import SITEMAP_PERIOD_DAYS_BACK

from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from scraper.horse_scraper.items import Article
from datetime import datetime, date, timedelta
from string import whitespace


class CronistaSitemapSpider(BaseArticleSitemapSpider):
    name = 'cronista_sitemap'
    source_name = 'Cronista'

    allowed_domains = ['cronista.com']

    sitemap_urls = [
        'https://www.cronista.com/sitemaps/v3/sitemaps-index.xml',
        'https://www.cronista.com/sitemaps/v3/news-daily-apertura.xml',
        'https://www.cronista.com/sitemaps/v3/news-daily-clase.xml',
        'https://www.cronista.com/sitemaps/v3/news-daily-cronista.xml',
        'https://www.cronista.com/sitemaps/v3/news-daily-pyme.xml',
        'https://www.cronista.com/sitemaps/v3/news-daily-rpm.xml',
        'https://www.cronista.com/sitemaps/v3/gnews-cronista.xml',
    ]

    def __init__(self, *args, **kwargs):

        today = date.today()

        date_strings = []

        for days in range(SITEMAP_PERIOD_DAYS_BACK):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, '04')
            day = format(search_date.day, '02')
            month = format(search_date.month, '02')

            date_strings.append(year + month + day)
            date_allow_str = '|'.join(date_strings)

        self.sitemap_rules = [
            ('(' + date_allow_str + ').*htm.*', 'parse_items'),
        ]

        self.sitemap_follow = [
            '.*'
        ]

        super().__init__(*args, **kwargs)

    def get_parser_functions(self):
        return[
            self.parser_1,
            self.parser_2,
            self.parser_3,
        ]

    def should_parse_sitemap_entry(self, entry):
        return True

    def parser_1(self, response):
        article_data = ArticleData()

        script_datos_articulo_json = response.xpath(
            '//script [@id="datosArticulo"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)

        title = html.unescape(script_datos_articulo['headline'])

        if('description' in script_datos_articulo):
            title += ' | ' + \
                html.unescape(script_datos_articulo['description'])

        title = title.strip()

        last_updated = script_datos_articulo['dateModified']
        last_updated = dateparser.parse(last_updated)

        text = response.xpath('//article [@id="nota"]//p//text()').extract()
        text = [line.strip() for line in text if line not in whitespace]
        text = [line for line in text if line != '']
        text = ' '.join(text)

        article_data['title'] = title
        article_data['text'] = text
        article_data['last_updated'] = last_updated

        return article_data

    def parser_2(self, response):
        article_data = ArticleData()

        script_datos_articulo_json = response.xpath(
            '//script [@id="datosArticulo"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(script_datos_articulo_json)

        title = html.unescape(script_datos_articulo['headline'])

        if('description' in script_datos_articulo):
            title += ' | ' + \
                html.unescape(script_datos_articulo['description'])

        title = title.strip()

        last_updated = script_datos_articulo['dateModified']
        last_updated = dateparser.parse(last_updated)

        article_container_clearfix = response.xpath(
            '//article [@class="container clearfix"]'
        )[0]

        content_text = article_container_clearfix.xpath(
            '//div [@class="content-txt"]/p//text()'
        ).extract()

        content_text = [
            line.strip() for line in content_text if line not in whitespace
        ]
        content_text = [line for line in content_text if line != '']

        text = ' '.join(content_text)

        article_data['title'] = title
        article_data['text'] = text
        article_data['last_updated'] = last_updated

        return article_data

    # Nota video
    def parser_3(self, response):
        article_data = ArticleData()

        title_tag = response.xpath(
            '//title//text()'
        ).extract_first()

        if(title_tag != 'Nota Video'):
            raise Exception('It\'s not a video article')

        title = response.xpath(
            '//h3 [@itemprop="headline name"]//text()'
        ).extract_first().strip()

        text = 'Nota Video'

        last_updated = datetime.now()

        article_data['title'] = title
        article_data['text'] = text
        article_data['last_updated'] = last_updated

        return article_data
