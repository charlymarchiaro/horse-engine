from ...base_article_sitemap_spider import BaseArticleSitemapSpider
from ...model import SpiderType
from .cronista_params import CronistaParams


class CronistaSitemapSpider(BaseArticleSitemapSpider):
    params = CronistaParams()
    name = params.get_spider_name(SpiderType.SITEMAP)
