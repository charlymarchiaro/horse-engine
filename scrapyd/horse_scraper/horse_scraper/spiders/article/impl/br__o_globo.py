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
        return "br__o_globo"

    def get_allowed_domains(self) -> List[str]:
        return ["oglobo.globo.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://oglobo.globo.com/",
            "https://oglobo.globo.com/rio/",
            "https://oglobo.globo.com/brasil/",
            "https://oglobo.globo.com/mundo/",
            "https://oglobo.globo.com/economia/",
            "https://oglobo.globo.com/cultura/",
            "https://oglobo.globo.com/sociedade/",
            "https://oglobo.globo.com/economia/tecnologia/",
            "https://oglobo.globo.com/sociedade/ciencia/",
            "https://oglobo.globo.com/sociedade/saude/",
            "https://oglobo.globo.com/sociedade/educacao/",
            "https://oglobo.globo.com/podcast/",
            "https://oglobo.globo.com/esportes/",
            "https://oglobo.globo.com/boa-viagem/",
            "https://oglobo.globo.com/rio/bairros/",
            "https://oglobo.globo.com/opiniao/",
            "https://oglobo.globo.com/blogs/",
            "https://oglobo.globo.com/videos/",
            "https://oglobo.globo.com/fotogalerias/",
            "https://oglobo.globo.com/ultimas-noticias",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=["oglobo.globo.com\/.+\/.+-\d{6,}"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://oglobo.globo.com/sitemap/noticias.xml"]

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
        return []


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
