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
        return "comunica_rse"

    def get_allowed_domains(self) -> List[str]:
        return ["comunicarseweb.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.comunicarseweb.com/",
            "https://www.comunicarseweb.com/categoria/Cambio%20Climatico",
            "https://www.comunicarseweb.com/categoria/ddhh",
            "https://www.comunicarseweb.com/categoria/cadena%20de%20valor",
            "https://www.comunicarseweb.com/categoria/energia",
            "https://www.comunicarseweb.com/categoria/transparencia",
            "https://www.comunicarseweb.com/categoria/agua",
            "https://www.comunicarseweb.com/categoria/arquitectura",
            "https://www.comunicarseweb.com/categoria/ceo",
            "https://www.comunicarseweb.com/categoria/ciudades",
            "https://www.comunicarseweb.com/categoria/compliance",
            "https://www.comunicarseweb.com/categoria/comunidad",
            "https://www.comunicarseweb.com/categoria/diversidad",
            "https://www.comunicarseweb.com/categoria/Econom%C3%ADa%20Circular",
            "https://www.comunicarseweb.com/categoria/energia",
            "https://www.comunicarseweb.com/categoria/Entrevistas",
            "https://www.comunicarseweb.com/categoria/Envases",
            "https://www.comunicarseweb.com/categoria/Gobierno%20Corporativo",
            "https://www.comunicarseweb.com/categoria/Inversores",
            "https://www.comunicarseweb.com/categoria/Investigaci%C3%B3n",
            "https://www.comunicarseweb.com/categoria/Nutrici%C3%B3n",
            "https://www.comunicarseweb.com/categoria/RRHH",
            "https://www.comunicarseweb.com/categoria/Seguridad%20Alimentaria",
            "https://www.comunicarseweb.com/categoria/Tendencias",
            "https://www.comunicarseweb.com/categoria/Transparencia",
            "https://www.comunicarseweb.com/categoria/Transporte",
            "https://www.comunicarseweb.com/categoria/Turismo",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*\/(noticia|hubs)\/.+"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return []

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
        last_updated = self.sanitize_date_str(
            extract_all_text(
                response,
                root_xpath='//span[contains(@class, "date")]',
                exclude_list=[],
            )
        )

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
