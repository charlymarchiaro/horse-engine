from ...base_article_sitemap_spider import BaseArticleSitemapSpider
from ...model import SpiderType
from .clarin_params import ClarinParams


class ClarinSitemapSpider(BaseArticleSitemapSpider):

    params = ClarinParams()
    name = params.get_spider_name(SpiderType.SITEMAP)
