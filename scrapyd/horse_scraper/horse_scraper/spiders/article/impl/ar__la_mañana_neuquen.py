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
        return "ar__la_mañana_neuquen"

    def get_allowed_domains(self) -> List[str]:
        return ["lmneuquen.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lmneuquen.com/",
            "https://www.lmneuquen.com/contenidos/ultimas-noticias.html",
            "https://www.lmneuquen.com/contenidos/neuquen.html",
            "https://www.lmneuquen.com/contenidos/policiales.html",
            "https://www.lmneuquen.com/contenidos/pais.html",
            "https://www.lmneuquen.com/contenidos/deportes.html",
            "https://www.lmneuquen.com/contenidos/espectaculos.html",
            "https://www.lmneuquen.com/contenidos/mundo.html",
            "https://www.lmneuquen.com/contenidos/ciencia-vida.html",
            "https://www.lmneuquen.com/contenidos/suplemento-dale.html",
            "https://www.lmneuquen.com/contenidos/suplemento-aniversarios.html",
            "https://www.lmneuquen.com/contenidos/suplementos-especiales.html",
            "https://www.lmneuquen.com/contenidos/necrologicas.html",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*-n\d{5,}$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.lmneuquen.com/sitemap.xml"]

    def get_sitemap_follow(self) -> List[str]:
        return [".*"]

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
        text = article_data.text

        # last_updated
        last_updated = dateparser.parse(
            response.xpath('//span[@itemprop="datePublished"]//@datetime').extract()[0]
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
