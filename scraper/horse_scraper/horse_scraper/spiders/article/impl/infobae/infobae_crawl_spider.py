from ...base_article_crawl_spider import BaseArticleCrawlSpider
from ...model import SpiderType
from .infobae_params import InfobaeParams


class InfobaeCrawlSpider(BaseArticleCrawlSpider):
    params = InfobaeParams()
    name = params.get_spider_name(SpiderType.CRAWL)
