from ...base_article_sitemap_spider import BaseArticleSitemapSpider
from ...model import SpiderType
from .infobae_params import InfobaeParams


class InfobaeSitemapSpider(BaseArticleSitemapSpider):
    params = InfobaeParams()
    name = params.get_spider_name(SpiderType.SITEMAP)
