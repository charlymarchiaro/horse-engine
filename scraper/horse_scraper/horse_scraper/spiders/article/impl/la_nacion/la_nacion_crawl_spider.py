from ...base_article_crawl_spider import BaseArticleCrawlSpider
from ...model import SpiderType
from .la_nacion_params import LaNacionParams


class LaNacionCrawlSpider(BaseArticleCrawlSpider):

    params = LaNacionParams()
    name = params.get_spider_name(SpiderType.CRAWL)
