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
        self.date_allow_str = self.get_date_allow_str(
            year_format="04",
            month_format="02",
            day_format="02",
            concat_fn=lambda year, month, day: f"{year}-{month}-{day}",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "ar__fortuna_web"

    def get_allowed_domains(self) -> List[str]:
        return ["fortuna.perfil.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://fortuna.perfil.com/",
            "https://fortuna.perfil.com/category/economia/",
            "https://fortuna.perfil.com/category/negocios/",
            "https://fortuna.perfil.com/category/mercados/",
            "https://fortuna.perfil.com/category/tecnologia/",
            "https://fortuna.perfil.com/category/protagonistas-empresas/",
            "https://fortuna.perfil.com/category/estilo/",
            "https://fortuna.perfil.com/category/a-fondo/",
            "https://fortuna.perfil.com/category/opinion/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str}).+\/"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://fortuna.perfil.com/sitemap.xml",
            "https://fortuna.perfil.com/news-sitemap.xml",
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

        # text
        images = response.xpath(
            '//div[contains(@id, "contenido-galeria")]//img'
        ).extract()

        is_photo_gallery = len(article_data.text) == 0 and images and len(images) > 0

        if is_photo_gallery:
            text = "Galería de fotos"
        else:
            text = article_data.text

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
