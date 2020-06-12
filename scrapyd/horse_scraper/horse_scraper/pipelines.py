# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

from .database.article_db_handler import ArticleDbHandler


class HorseScraperPipeline(object):
    def process_item(self, item, spider):
        handler = ArticleDbHandler()
        handler.persist(item, spider.params.keep_url_query_string)
