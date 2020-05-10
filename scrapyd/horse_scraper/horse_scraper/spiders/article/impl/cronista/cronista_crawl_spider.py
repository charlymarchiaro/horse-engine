from ...base_article_crawl_spider import BaseArticleCrawlSpider
from ...model import SpiderType
from .cronista_params import CronistaParams


class CronistaCrawlSpider(BaseArticleCrawlSpider):
    params = CronistaParams()
    name = params.get_spider_name(SpiderType.CRAWL)
