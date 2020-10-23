from typing import Tuple, List, Dict, Any, Union, Callable, cast

import time

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
from horse_scraper.settings import DOWNLOAD_DELAY
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
            concat_fn=lambda year, month, day: f"/{year}/{month}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "br__estadao"

    def get_allowed_domains(self) -> List[str]:
        return ["estadao.com.br"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.estadao.com.br/",
            "https://alias.estadao.com.br",
            "https://brasil.estadao.com.br",
            "https://ciencia.estadao.com.br",
            "https://cultura.estadao.com.br",
            "https://economia.estadao.com.br",
            "https://educacao.estadao.com.br",
            "https://esportes.estadao.com.br",
            "https://internacional.estadao.com.br",
            "https://loterias.estadao.com.br",
            "https://opiniao.estadao.com.br",
            "https://pme.estadao.com.br",
            "https://politica.estadao.com.br",
            "https://sao-paulo.estadao.com.br",
            "https://saude.estadao.com.br",
            "https://sustentabilidade.estadao.com.br",
            "https://www.estadao.com.br",
            "https://esportefera.com.br",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["estadao.com.br\/noticias\/.+,\d{5,}"], deny_re=["\/correcoes\/"]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://alias.estadao.com.br/sitemap/alias/auto.xml",
            "https://brasil.estadao.com.br/sitemap/brasil/auto.xml",
            "https://ciencia.estadao.com.br/sitemap/ciencia/auto.xml",
            "https://cultura.estadao.com.br/sitemap/cultura/auto.xml",
            "https://economia.estadao.com.br/sitemap/economia/auto.xml",
            "https://educacao.estadao.com.br/sitemap/educacao/auto.xml",
            "https://esportes.estadao.com.br/sitemap/esportes/auto.xml",
            "https://internacional.estadao.com.br/sitemap/internacional/auto.xml",
            "https://loterias.estadao.com.br/sitemap/loterias/Sitemap.xml",
            "https://opiniao.estadao.com.br/sitemap/opiniao/auto.xml",
            "https://pme.estadao.com.br/sitemap/pme/auto.xml",
            "https://politica.estadao.com.br/sitemap/politica/auto.xml",
            "https://sao-paulo.estadao.com.br/sitemap/sao-paulo/auto.xml",
            "https://saude.estadao.com.br/sitemap/saude/auto.xml",
            "https://sustentabilidade.estadao.com.br/sitemap/sustentabilidade/auto.xml",
            "https://www.estadao.com.br/sitemap/www.estadao/auto.xml",
            "https://esportefera.com.br/sitemap/fera/auto.xml",
        ]

    def get_sitemap_follow(self) -> List[str]:
        return [
            "mes-atual",
            f"({self.date_allow_str})",
        ]

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
        # For some reason, this spider does not respect the download delay --> using time.sleep
        time.sleep(DOWNLOAD_DELAY)

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated
        text = article_data.text

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
