from ...base_article_sitemap_spider import BaseArticleSitemapSpider
from ...model import SpiderType
from .metro951_params import Metro951Params


class Metro951SitemapSpider(BaseArticleSitemapSpider):
    params = Metro951Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
