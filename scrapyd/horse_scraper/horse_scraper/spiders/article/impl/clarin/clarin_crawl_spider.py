from ...base_article_crawl_spider import BaseArticleCrawlSpider
from ...model import SpiderType
from .clarin_params import ClarinParams


class ClarinCrawlSpider(BaseArticleCrawlSpider):
    params = ClarinParams()
    name = params.get_spider_name(SpiderType.CRAWL)
