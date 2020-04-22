import scrapy
import re
import dateparser
import json
import html

from scraper.horse_scraper.spiders.article.base_article_sitemap_spider import BaseArticleSitemapSpider, ArticleData

from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from scraper.horse_scraper.items import Article
from datetime import datetime, date, timedelta
from string import whitespace


class LaNacionSitemapSpider(BaseArticleSitemapSpider):
    name = 'la_nacion_sitemap'
    source_name = 'La Nacion'

    allowed_domains = ['lanacion.com.ar']

    sitemap_urls = [
        'https://www.lanacion.com.ar/sitemap.xml'
    ]

    def __init__(self, *args, **kwargs):

        self.sitemap_rules = [
            ('.*nid\d+', 'parse_items'),
        ]

        self.sitemap_follow = [
            '.*'
        ]

        super().__init__(*args, **kwargs)

    def get_parser_functions(self):
        return[
            self.parser_1,
        ]

    def should_parse_sitemap_entry(self, entry):
        return True

    def parser_1(self, response):
        article_data = ArticleData()

        script_datos_articulo_json = response.xpath(
            '//script [@id="Schema_NewsArticle"]//text()'
        ).extract_first()

        script_datos_articulo = json.loads(
            script_datos_articulo_json
        )

        title = html.unescape(script_datos_articulo['headline'])
        title = title.strip()

        last_updated = response.xpath(
            '//meta [@property="article:published_time"]/@content'
        ).extract_first()
        last_updated = dateparser.parse(last_updated)

        text = response.xpath(
            '//section [@id="cuerpo"]//*[self::p or self::ul or self::ol or self::li]//text()'
        ).extract()
        text = [line.strip() for line in text if line not in whitespace]
        text = [line for line in text if line != '']
        text = ' '.join(text)

        article_data['title'] = title
        article_data['text'] = text
        article_data['last_updated'] = last_updated

        return article_data
