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
        return "pe__correo"

    def get_allowed_domains(self) -> List[str]:
        return ["diariocorreo.pe"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://diariocorreo.pe/",
            "https://diariocorreo.pe/politica/",
            "https://diariocorreo.pe/peru/",
            "https://diariocorreo.pe/mundo/",
            "https://diariocorreo.pe/edicion/lima/",
            "https://diariocorreo.pe/deportes/",
            "https://diariocorreo.pe/economia/",
            "https://diariocorreo.pe/espectaculos/",
            "https://diariocorreo.pe/miscelanea/",
            "https://diariocorreo.pe/salud/",
            "https://diariocorreo.pe/noticias/apurimac/",
            "https://diariocorreo.pe/noticias/ancash/",
            "https://diariocorreo.pe/edicion/arequipa/",
            "https://diariocorreo.pe/edicion/ayacucho/",
            "https://diariocorreo.pe/edicion/chimbote/",
            "https://diariocorreo.pe/edicion/cusco/",
            "https://diariocorreo.pe/edicion/huancavelica/",
            "https://diariocorreo.pe/edicion/huanuco/",
            "https://diariocorreo.pe/edicion/huancayo/",
            "https://diariocorreo.pe/edicion/ica/",
            "https://diariocorreo.pe/edicion/lambayeque/",
            "https://diariocorreo.pe/edicion/la-libertad/",
            "https://diariocorreo.pe/edicion/moquegua/",
            "https://diariocorreo.pe/edicion/piura/",
            "https://diariocorreo.pe/edicion/puno/",
            "https://diariocorreo.pe/noticias/san-martin/",
            "https://diariocorreo.pe/edicion/tacna/",
            "https://diariocorreo.pe/edicion/tumbes/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["diariocorreo.pe\/.+\/.+-noticia(-\d+)?\/$"], deny_re=[]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://diariocorreo.pe/sitemap/?outputType=xml",
            "https://diariocorreo.pe/sitemap/web/miscelanea/?outputType=xml",
            "https://diariocorreo.pe/sitemap/news/deportes/?outputType=xml",
            "https://diariocorreo.pe/sitemap/web/edicion/?outputType=xml",
            "https://diariocorreo.pe/sitemap/news/edicion/?outputType=xml",
            "https://diariocorreo.pe/sitemap/news/economia/?outputType=xml",
            "https://diariocorreo.pe/sitemap/web/peru/?outputType=xml",
            "https://diariocorreo.pe/sitemap/news/espectaculos/?outputType=xml",
            "https://diariocorreo.pe/sitemap/web/espectaculos/?outputType=xml",
            "https://diariocorreo.pe/sitemap/news/miscelanea/?outputType=xml",
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
