# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy  # type: ignore


class Article(scrapy.Item):
    source_name = scrapy.Field()
    url = scrapy.Field()
    title = scrapy.Field()
    text = scrapy.Field()
    last_updated = scrapy.Field()
    scraped_at = scrapy.Field()
    spider_name = scrapy.Field()
    parse_function = scrapy.Field()
    result = scrapy.Field()
    error = scrapy.Field()
    error_details = scrapy.Field()
