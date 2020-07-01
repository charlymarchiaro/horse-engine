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
        return "iprofesional"

    def get_allowed_domains(self) -> List[str]:
        return ["iprofesional.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.iprofesional.com/",
            "https://www.iprofesional.com/insider",
            "https://www.iprofesional.com/home",
            "https://www.iprofesional.com/economia",
            "https://www.iprofesional.com/politica",
            "https://www.iprofesional.com/finanzas",
            "https://www.iprofesional.com/impuestos",
            "https://www.iprofesional.com/legales",
            "https://www.iprofesional.com/negocios",
            "https://www.iprofesional.com/tecnologia",
            "https://www.iprofesional.com/comex",
            "https://www.iprofesional.com/management",
            "https://www.iprofesional.com/autos",
            "https://www.iprofesional.com/vinos",
            "https://www.iprofesional.com/health-tech",
            "https://www.iprofesional.com/lobocity",
            "https://www.iprofesional.com/ipro-up",
            "https://www.iprofesional.com/recreo",
            "https://www.iprofesional.com/marketing",
            "https://www.iprofesional.com/actualidad",
            "https://www.iprofesional.com/dolar-hoy",
            "https://www.iprofesional.com/elecciones",
            "https://www.iprofesional.com/inflacion",
            "https://www.iprofesional.com/turismo",
            "https://www.iprofesional.com/afip",
            "https://www.iprofesional.com/anses",
            "https://www.iprofesional.com/monotributo",
            "https://www.iprofesional.com/ganancias",
            "https://www.iprofesional.com/lo-mas-destacado-del-dia",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*\/\d{5,}-.+"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.iprofesional.com/sitemap-news.xml"]

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
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "textonota")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "tepuedeinteresar"),
                (AttributeType.CLASS, "accesohome"),
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
