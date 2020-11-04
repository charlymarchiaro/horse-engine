import logging
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
        self.keep_url_query_string = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "mx__reforma"

    def get_allowed_domains(self) -> List[str]:
        return ["reforma.com"]

    def pre_process_url(self, url) -> str:
        return (
            "https://www.reforma.com/aplicacioneslibre/preacceso/articulo/default.aspx?urlredirect="
            + url
        )

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.reforma.com/",
            "https://www.reforma.com/internacional/",
            "https://www.reforma.com/nacional/",
            "https://www.reforma.com/ciudad/",
            "https://www.reforma.com/justicia/",
            "https://www.reforma.com/estados/",
            "https://www.reforma.com/negocios/",
            "https://www.reforma.com/negocios/energia/",
            "https://www.reforma.com/negocios/empresas/",
            "https://www.reforma.com/negocios/bienesraices/",
            "https://www.reforma.com/gente/",
            "https://www.reforma.com/cultura/",
            "https://www.reforma.com/ciencia/",
            "https://www.reforma.com/revistar/",
            "https://www.reforma.com/coberturaespecial/",
            "https://www.reforma.com/editoriales/",
            "https://www.reforma.com/video/",
            "https://www.reforma.com/vida/",
            "https://www.reforma.com/deviaje/",
            "https://www.reforma.com/gadgets/",
            "https://www.reforma.com/automotriz/",
            "https://www.reforma.com/moda/",
            "https://www.reforma.com/campanas/",
            "https://www.reforma.com/buenamesa/",
            "https://www.reforma.com/primerafila/",
            "https://www.reforma.com/universitarios/",
            "https://www.reforma.com/entremuros/",
            "https://www.reforma.com/verde/",
            "https://www.reforma.com/redcarpet/",
            "https://www.reforma.com/club/",
            "https://www.reforma.com/murosocial/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[".*\/ar\d{6,}"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return ["https://www.reforma.com/news_sitemap.xml"]

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
        script_text = extract_all_text(
            response, root_xpath='//script[@type="text/javascript"]', exclude_list=[],
        )

        matches = re.findall("'(?P<text><p class=\"textoMovil\">.+)'", script_text)
        html = "".join(matches)

        res = HtmlResponse(url=response.url, body=html, encoding="utf-8")
        text = " || ".join(res.xpath("//text()").extract())

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
