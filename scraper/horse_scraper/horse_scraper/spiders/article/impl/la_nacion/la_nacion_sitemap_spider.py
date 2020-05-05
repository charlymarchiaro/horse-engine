from ...base_article_sitemap_spider import BaseArticleSitemapSpider
from ...model import SpiderType
from .la_nacion_params import LaNacionParams


class LaNacionSitemapSpider(BaseArticleSitemapSpider):
    params = LaNacionParams()
    name = params.get_spider_name(SpiderType.SITEMAP)
