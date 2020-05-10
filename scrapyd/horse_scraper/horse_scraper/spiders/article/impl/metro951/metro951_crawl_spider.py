from ...base_article_crawl_spider import BaseArticleCrawlSpider
from ...model import SpiderType
from .metro951_params import Metro951Params


class Metro951CrawlSpider(BaseArticleCrawlSpider):

    params = Metro951Params()
    name = params.get_spider_name(SpiderType.CRAWL)
