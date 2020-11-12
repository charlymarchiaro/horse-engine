from typing import Tuple, List, Dict, Any, Union, Callable, cast

import json
import html
import dateparser  # type: ignore
from datetime import datetime, date, timedelta
from string import whitespace
import re

from scrapy.http import Request, HtmlResponse  # type: ignore
from scrapy.linkextractors import LinkExtractor  # type: ignore
from scrapy.spiders import Rule  # type: ignore

from horse_scraper.items import Article
from horse_scraper.spiders.article.model import ArticleData, SpiderType
from horse_scraper.spiders.article.base_article_spider_params import (
    BaseArticleSpiderParams,
    UrlFilter,
)
from horse_scraper.services.utils.parse_utils import (
    extract_all_text,
    AttributeType,
    get_publishing_date,
)
from ..base_article_crawl_spider import BaseArticleCrawlSpider
from ..base_article_sitemap_spider import BaseArticleSitemapSpider


class Params(BaseArticleSpiderParams):
    def _after_initialize(self) -> None:
        pass

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ve__las_ultimas_noticias"

    def get_allowed_domains(self) -> List[str]:
        return ["ultimasnoticias.com.ve"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://ultimasnoticias.com.ve/",
            "https://ultimasnoticias.com.ve/mas-vida/",
            "https://ultimasnoticias.com.ve/superbarrio/",
            "https://ultimasnoticias.com.ve/tumascota/",
            "https://ultimasnoticias.com.ve/politica/",
            "https://ultimasnoticias.com.ve/economia/",
            "https://ultimasnoticias.com.ve/sucesos/",
            "https://ultimasnoticias.com.ve/deportes/",
            "https://ultimasnoticias.com.ve/opinion/",
            "https://ultimasnoticias.com.ve/mundo/",
            "https://ultimasnoticias.com.ve/chevere/",
            "https://ultimasnoticias.com.ve/pulso-regional/",
            "https://ultimasnoticias.com.ve/amazonas/",
            "https://ultimasnoticias.com.ve/anzoategui/",
            "https://ultimasnoticias.com.ve/apure/",
            "https://ultimasnoticias.com.ve/aragua/",
            "https://ultimasnoticias.com.ve/barinas/",
            "https://ultimasnoticias.com.ve/bolivar/",
            "https://ultimasnoticias.com.ve/carabobo/",
            "https://ultimasnoticias.com.ve/cojedes/",
            "https://ultimasnoticias.com.ve/delta-amacuro/",
            "https://ultimasnoticias.com.ve/falcon/",
            "https://ultimasnoticias.com.ve/guarico/",
            "https://ultimasnoticias.com.ve/la-guaira/",
            "https://ultimasnoticias.com.ve/lara/",
            "https://ultimasnoticias.com.ve/merida/",
            "https://ultimasnoticias.com.ve/miranda/",
            "https://ultimasnoticias.com.ve/monagas/",
            "https://ultimasnoticias.com.ve/nueva-esparta/",
            "https://ultimasnoticias.com.ve/portuguesa/",
            "https://ultimasnoticias.com.ve/sucre/",
            "https://ultimasnoticias.com.ve/tachira/",
            "https://ultimasnoticias.com.ve/trujillo/",
            "https://ultimasnoticias.com.ve/yaracuy/",
            "https://ultimasnoticias.com.ve/zulia/",
            "https://ultimasnoticias.com.ve/bienestar/",
            "https://ultimasnoticias.com.ve/ros-feng-shui/",
            "https://ultimasnoticias.com.ve/cocina/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["ultimasnoticias.com.ve\/noticias\/"],
            deny_re=["\/author\/", "\/page\/"],
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://ultimasnoticias.com.ve/sitemap.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return ["posttype-post"]

    def should_parse_sitemap_entry(self, entry: Any) -> bool:
        return True

    def should_follow_sitemap_url(self, url: str) -> bool:
        return True

    def should_follow_article_url(self, url: str) -> bool:
        return True

    # Parser functions

    def get_parser_functions(self) -> List[Callable[[HtmlResponse], ArticleData]]:
        return [
            self.parser_1,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "post-content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
