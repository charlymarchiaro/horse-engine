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
        return "ar__red_users"

    def get_allowed_domains(self) -> List[str]:
        return ["redusers.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "http://www.redusers.com/noticias/",
            "http://www.redusers.com/noticias/category/actualidad-nacional/",
            "http://www.redusers.com/noticias/category/automoviles/",
            "http://www.redusers.com/noticias/category/colecciones/",
            "http://www.redusers.com/noticias/category/content-studio/",
            "http://www.redusers.com/noticias/category/empresas/",
            "http://www.redusers.com/noticias/category/hardware/",
            "http://www.redusers.com/noticias/category/internet/",
            "http://www.redusers.com/noticias/category/juegos/",
            "http://www.redusers.com/noticias/category/mobile/",
            "http://www.redusers.com/noticias/category/power/",
            "http://www.redusers.com/noticias/category/programacion-2/",
            "http://www.redusers.com/noticias/category/seguridad/",
            "http://www.redusers.com/noticias/category/software/",
            "http://www.redusers.com/noticias/category/telecomunicaciones/",
            "http://www.redusers.com/noticias/category/userlandia/",
            "http://www.redusers.com/noticias/category/users/",
            "http://www.redusers.com/noticias/cat-reviews/elegidos/",
            "http://www.redusers.com/noticias/cat-reviews/gaming/",
            "http://www.redusers.com/noticias/cat-reviews/hardware/",
            "http://www.redusers.com/noticias/cat-reviews/imagen-y-sonido/",
            "http://www.redusers.com/noticias/cat-reviews/impresora/",
            "http://www.redusers.com/noticias/cat-reviews/mobile/",
            "http://www.redusers.com/noticias/cat-reviews/notebooks-y-pcs/",
            "http://www.redusers.com/noticias/cat-reviews/perifericos/",
            "http://www.redusers.com/noticias/cat-reviews/scanners/",
            "http://www.redusers.com/noticias/cat-reviews/smart-tv/",
            "http://www.redusers.com/noticias/cat-reviews/software/",
            "http://www.redusers.com/noticias/cat-reviews/tablet/",
            "http://www.redusers.com/noticias/marcas-publicaciones/colecciones/",
            "http://www.redusers.com/noticias/marcas-publicaciones/guias-users/",
            "http://www.redusers.com/noticias/marcas-publicaciones/informes-users/",
            "http://www.redusers.com/noticias/marcas-publicaciones/libros/",
            "http://www.redusers.com/noticias/marcas-publicaciones/power/",
            "http://www.redusers.com/noticias/marcas-publicaciones/users/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-hardware/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-internet/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-juegos/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-moviles/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-multimedia/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-office/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-utilitarios/",
            "http://www.redusers.com/noticias/cat_trucos/trucos-windows/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*\/noticias.{20,}\/$"], deny_re=[".*\/noticias(\/.*){3,}"]
        )

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
            self.parser_2,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "post_content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "breadcrumb"),
                (AttributeType.CLASS, "post_barracompartir"),
                (AttributeType.CLASS, "post_recuadros"),
                (AttributeType.CLASS, "magzine"),
                (AttributeType.ID, "comments"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='//div[contains(@class, "post_fecha_autor")]',
                exclude_list=[],
            )
        )

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "post_content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "breadcrumb"),
                (AttributeType.CLASS, "post_barracompartir"),
                (AttributeType.CLASS, "post_recuadros"),
                (AttributeType.CLASS, "magzine"),
                (AttributeType.ID, "comments"),
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
