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
        return "pe__gestion"

    def get_allowed_domains(self) -> List[str]:
        return ["gestion.pe"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://gestion.pe/",
            "https://gestion.pe/economia",
            "https://gestion.pe/economia/mercados",
            "https://gestion.pe/economia/empresas",
            "https://gestion.pe/economia/management-empleo",
            "https://gestion.pe/peru",
            "https://gestion.pe/peru/politica",
            "https://gestion.pe/tu-dinero",
            "https://gestion.pe/tu-dinero/finanzas-personales",
            "https://gestion.pe/tu-dinero/inmobiliarias",
            "https://gestion.pe/tendencias",
            "https://gestion.pe/tendencias/lujo",
            "https://gestion.pe/tendencias/viajes",
            "https://gestion.pe/tendencias/moda",
            "https://gestion.pe/tendencias/estilos",
            "https://gestion.pe/mundo",
            "https://gestion.pe/mundo/eeuu",
            "https://gestion.pe/mundo/mexico",
            "https://gestion.pe/mundo/espana",
            "https://gestion.pe/mundo/internacional",
            "https://gestion.pe/tecnologia",
            "https://gestion.pe/podcast",
            "https://gestion.pe/opinion",
            "https://gestion.pe/opinion/editorial",
            "https://gestion.pe/opinion/pregunta-de-hoy",
            "https://gestion.pe/gestion-tv",
            "https://gestion.pe/videos",
            "https://gestion.pe/fotogalerias",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=["gestion.pe\/.+\/.+-noticia(-\d+)?\/$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://gestion.pe/arcio/sitemap/",
            "https://gestion.pe/arcio/google-news-feed/",
            "https://gestion.pe/arcio/news-sitemap/",
        ]

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
            root_xpath='//div[contains(@class, "story-content__content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "story-content__caption"),
                (AttributeType.CLASS, "story-content__blockquote"),
                (AttributeType.CLASS, "story-content__paragraph-list"),
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
