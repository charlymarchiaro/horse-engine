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
        # Enable Splash to parse dynamically loaded content
        self.splash_enabled = True
        self.splash_wait_time = 2.5
        self.splash_private_mode_enabled = False

    # Common params
    def _get_spider_base_name(self) -> str:
        return "grupo_la_provincia"

    def get_allowed_domains(self) -> List[str]:
        return ["grupolaprovincia.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.grupolaprovincia.com/",
            "https://www.grupolaprovincia.com/seccion/legislativas",
            "https://www.grupolaprovincia.com/seccion/economia",
            "https://www.grupolaprovincia.com/seccion/infraestructura",
            "https://www.grupolaprovincia.com/seccion/interes-general",
            "https://www.grupolaprovincia.com/seccion/entrevistas",
            "https://www.grupolaprovincia.com/seccion/opinion",
            "https://www.grupolaprovincia.com/seccion/deportes",
            "https://www.grupolaprovincia.com/seccion/espectaculos",
            "https://www.grupolaprovincia.com/seccion/humor",
            "https://www.grupolaprovincia.com/seccion/audios",
            "https://www.grupolaprovincia.com/seccion/videos",
            "https://www.grupolaprovincia.com/seccion/municipales",
            "https://www.grupolaprovincia.com/seccion/argentina",
            "https://www.grupolaprovincia.com/seccion/buenos-aires",
            "https://www.grupolaprovincia.com/seccion/internacionales",
            "https://www.grupolaprovincia.com/seccion/politica",
            "https://www.grupolaprovincia.com/seccion/agropecuario",
            "https://www.grupolaprovincia.com/seccion/sociedad",
            "https://www.grupolaprovincia.com/seccion/seguridad",
            "https://www.grupolaprovincia.com/seccion/gremiales",
            "https://www.grupolaprovincia.com/seccion/servicios",
            "https://www.grupolaprovincia.com/seccion/cultura",
            "https://www.grupolaprovincia.com/seccion/ultimas-noticias",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*-\d{5,}$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://grupolaprovincia.com/sitemaps/sitemap-index.xml"]

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
            root_xpath='//div[contains(@class, "article-body-content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "blockquote"),
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
