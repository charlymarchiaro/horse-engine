import scrapy
import re
import dateparser
import json
import html

from scraper.horse_scraper.spiders.article.base_article_spider import BaseArticleSpider, ArticleData
from scraper.horse_scraper.settings import SEARCH_PERIOD_DAYS_BACK

from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from scraper.horse_scraper.items import Article
from datetime import datetime, date, timedelta
from string import whitespace


class InfobaeCrawlSpider(BaseArticleSpider):
    name = 'metro951_crawl'
    source_name = 'Metro951'

    allowed_domains = ['metro951.com']

    start_urls = [
        'https://www.metro951.com/?s=%22%22&orderby=date&order=DESC'
    ]

    def __init__(self):

        today = date.today()

        date_strings = []

        for days in range(SEARCH_PERIOD_DAYS_BACK):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, '04')
            month = format(search_date.month, '02')

            date_strings.append('/' + year + '/' + month + '/')
            date_allow_str = '|'.join(date_strings)

        self.rules = (
            Rule(
                callback=self.parse_items,
                link_extractor=LinkExtractor(
                    allow='.*(' + date_allow_str + ').*',
                ),
                process_links='process_links',
                follow=True,
            ),
        )

        super().__init__()

    def get_parser_functions(self):
        return[
            self.parser_1,
        ]

    def parser_1(self, response):
        article_data = ArticleData()

        script_datos_articulo_json = response.xpath(
            '//script [@class="aioseop-schema"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(
            script_datos_articulo_json
        )['@graph']

        if 'description' in script_datos_articulo[2]:
            description = script_datos_articulo[2]['description']
        else:
            description = ''

        title = html.unescape(script_datos_articulo[3]['headline']) \
            + ' | ' + html.unescape(description)
        title = title.strip()

        last_updated = script_datos_articulo[3]['dateModified']
        last_updated = dateparser.parse(last_updated)

        text = response.xpath(
            '//div [contains(@class, "singlePost__content")]//*[self::p or self::ul or self::ol or self::li]//text()'
        ).extract()
        text = [line.strip() for line in text if line not in whitespace]
        text = [line for line in text if line != '']
        text = ' '.join(text)

        article_data['title'] = title
        article_data['text'] = text
        article_data['last_updated'] = last_updated

        return article_data