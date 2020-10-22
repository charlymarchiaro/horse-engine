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
        # Override to stop redirects
        self.dont_redirect = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "uy__el_pais"

    def get_allowed_domains(self) -> List[str]:
        return ["elpais.com.uy"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.elpais.com.uy/",
            "https://www.elpais.com.uy/informacion",
            "https://www.elpais.com.uy/mundo",
            "https://www.elpais.com.uy/vida-actual",
            "https://www.elpais.com.uy/opinion",
            "https://www.elpais.com.uy/opinion/editorial",
            "https://www.elpais.com.uy/opinion/ecos",
            "https://www.elpais.com.uy/opinion/columnistas",
            "https://www.elpais.com.uy/ovacion",
            "https://www.elpais.com.uy/ovacion/futbol",
            "https://www.elpais.com.uy/ovacion/seleccion",
            "https://www.elpais.com.uy/ovacion/copa-america",
            "https://www.elpais.com.uy/ovacion/estadisticas",
            "https://www.elpais.com.uy/ovacion/basquetbol",
            "https://www.elpais.com.uy/ovacion/tenis",
            "https://www.elpais.com.uy/ovacion/rugby",
            "https://www.elpais.com.uy/ovacion/multideportivo",
            "https://www.elpais.com.uy/ovacion/turf",
            "https://www.elpais.com.uy/ovacion/golf",
            "https://www.elpais.com.uy/negocios",
            "https://www.elpais.com.uy/tvshow",
            "https://www.elpais.com.uy/tvshow/sociales",
            "https://www.elpais.com.uy/eme",
            "https://www.elpais.com.uy/multimedia",
            "https://www.elpais.com.uy/impresa",
            "http://rurales.elpais.com.uy/",
            "https://www.elpais.com.uy/especiales",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["www.elpais.com.uy\/.+\/.{20,}.html"], deny_re=["\/noticias\/"]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.elpais.com.uy/sitemap-index.xml",
            "https://www.elpais.com.uy/sitemap-google-news.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [".*sitemap-articles.*"]

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
            root_xpath='//div[contains(@class, "content-modules")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "ads"),
                (AttributeType.CLASS, "contenido-exclusivo"),
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
