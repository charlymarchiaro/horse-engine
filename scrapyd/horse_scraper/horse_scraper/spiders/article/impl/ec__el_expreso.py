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
        return "ec__el_expreso"

    def get_allowed_domains(self) -> List[str]:
        return ["expreso.ec"]

    def pre_process_url(self, url) -> str:
        url = str(url)
        # if last part of url does not have an extension, add .html
        if url[-5:].find(".") == -1:
            url += ".html"
        return url

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.expreso.ec/",
            "https://www.expreso.ec/actualidad",
            "https://www.expreso.ec/actualidad/politica",
            "https://www.expreso.ec/actualidad/economia",
            "https://www.expreso.ec/actualidad/mundo",
            "https://www.expreso.ec/guayaquil",
            "https://www.expreso.ec/guayaquil/guayacos",
            "https://www.expreso.ec/deportes",
            "https://www.expreso.ec/opinion",
            "https://www.expreso.ec/opinion/editoriales",
            "https://www.expreso.ec/opinion/columnas",
            "https://www.expreso.ec/buenavida",
            "https://www.expreso.ec/ciencia-y-tecnologia",
            "https://www.expreso.ec/buenavida/salud",
            "https://www.expreso.ec/buenavida/sexualidad",
            "https://www.expreso.ec/buenavida/buenavida-moda",
            "https://www.expreso.ec/buenavida/trabajo",
            "https://www.expreso.ec/ocio",
            "https://www.expreso.ec/ocio/musica",
            "https://www.expreso.ec/ocio/viajes",
            "https://www.expreso.ec/ocio/tv",
            "https://www.expreso.ec/ocio/influencers",
            "https://www.expreso.ec/ocio/cine",
            "https://www.expreso.ec/actualidad",
            "https://www.expreso.ec/actualidad/politica",
            "https://www.expreso.ec/actualidad/economia",
            "https://www.expreso.ec/actualidad/mundo",
            "https://www.expreso.ec/guayaquil",
            "https://www.expreso.ec/guayaquil/guayacos",
            "https://www.expreso.ec/deportes",
            "https://www.expreso.ec/buenavida",
            "https://www.expreso.ec/ciencia-y-tecnologia",
            "https://www.expreso.ec/buenavida/salud",
            "https://www.expreso.ec/buenavida/sexualidad",
            "https://www.expreso.ec/buenavida/buenavida-moda",
            "https://www.expreso.ec/buenavida/trabajo",
            "https://www.expreso.ec/ocio",
            "https://www.expreso.ec/ocio/musica",
            "https://www.expreso.ec/ocio/viajes",
            "https://www.expreso.ec/ocio/influencers",
            "https://www.expreso.ec/ocio/cultura",
            "https://www.expreso.ec/ocio/tv",
            "https://www.expreso.ec/ocio/cine",
            "https://www.expreso.ec/opinion",
            "https://www.expreso.ec/opinion/editoriales",
            "https://www.expreso.ec/opinion/columnas",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=["expreso.ec\/.+\/.+-\d+(.html)?$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.expreso.ec/sitemap-index.xml",
            "https://www.expreso.ec/sitemap-google-news.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return ["sitemap-noticias"]

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
            root_xpath='//div[contains(@class, "content-modules-container")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "content-highlight"),
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
