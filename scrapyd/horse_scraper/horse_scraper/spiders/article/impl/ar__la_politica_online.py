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
        return "ar__la_politica_online"

    def get_allowed_domains(self) -> List[str]:
        return ["lapoliticaonline.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.lapoliticaonline.com/",
            "https://www.lapoliticaonline.com/seccion/politica/",
            "https://www.lapoliticaonline.com/seccion/economia/",
            "https://www.lapoliticaonline.com/seccion/judiciales/",
            "https://www.lapoliticaonline.com/seccion/ciudad/",
            "https://www.lapoliticaonline.com/seccion/provincia/",
            "https://www.lapoliticaonline.com/seccion/conurbano/",
            "https://www.lapoliticaonline.com/seccion/empresas/",
            "https://www.lapoliticaonline.com/seccion/mexico/",
            "https://www.lapoliticaonline.com/seccion/espana/",
            "https://www.lapoliticaonline.com/seccion/entrevista/",
            "https://www.lapoliticaonline.com/seccion/campo/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[".*\/nota\/\d{6,}.+"],
            deny_re=[".*\_commentpage\_.*", ".*\_page\_.*"],
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

        try:
            # Filtering by id (integer) present in URL
            match = re.search(".*\/nota\/(\d{6,}).+", url)
            if match:
                article_id = int(match.group(1))
                if article_id > 120000:
                    return True
            return False

        except:
            return False

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
            root_xpath='//div[contains(@class, "vsmcontent")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "content-type-noticia"),
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
