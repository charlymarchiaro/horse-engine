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
    name = 'infobae_crawl'
    source_name = 'Infobae'

    allowed_domains = ['infobae.com']

    start_urls = [
        'https://www.infobae.com/',
        'https://www.infobae.com/ultimas-noticias/'
    ]

    def __init__(self, *args, **kwargs):

        today = date.today()

        date_strings = []

        for days in range(SEARCH_PERIOD_DAYS_BACK):
            search_date = today - timedelta(days=days)
            year = format(search_date.year, '04')
            day = format(search_date.day, '02')
            month = format(search_date.month, '02')

            date_strings.append('/' + year + '/' + month + '/' + day + '/')
            date_allow_str = '|'.join(date_strings)

        self.rules = (
            Rule(
                callback=self.parse_items,
                link_extractor=LinkExtractor(
                    allow='.*(' + date_allow_str + ').*',
                    deny='.*(/fotos/)',
                ),
                process_links='process_links',
                follow=True,
            ),
        )

        super().__init__(*args, **kwargs)

    def get_parser_functions(self):
        return[
            self.parser_1,
        ]

    def parser_1(self, response):
        article_data = ArticleData()

        title = response.xpath('//h1//text()').extract_first() + ' | ' \
            + (response.xpath('//span [@class="subheadline"]//text()').extract_first() or '')
        title = title.strip()

        last_updated = response.xpath(
            '//meta [@itemprop="pubdate"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        text = response.xpath(
            '//div [@id="article-content"]//p [@class="element element-paragraph"]//text()'
        ).extract()
        text = [line.strip() for line in text if line not in whitespace]
        text = [line for line in text if line != '']
        text = ' '.join(text)

        article_data['title'] = title
        article_data['text'] = text
        article_data['last_updated'] = last_updated

        return article_data