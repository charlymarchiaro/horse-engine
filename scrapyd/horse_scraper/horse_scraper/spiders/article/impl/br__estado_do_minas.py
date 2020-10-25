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
            concat_fn=lambda year, month, day: f"/{year}/{month}/{day}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "br__estado_do_minas"

    def get_allowed_domains(self) -> List[str]:
        return ["em.com.br"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.em.com.br/",
            "https://www.em.com.br/gerais/",
            "https://www.em.com.br/politica/",
            "https://www.em.com.br/economia/",
            "https://www.em.com.br/nacional/",
            "https://www.em.com.br/internacional/",
            "https://www.em.com.br/tudosobre/coronavirus/",
            "https://www.em.com.br/saude/",
            "https://www.em.com.br/colunistas/",
            "https://www.em.com.br/cultura/",
            "https://www.em.com.br/educacao/",
            "https://www.em.com.br/tecnologia/",
            "https://www.em.com.br/regioes/",
            "https://www.em.com.br/agropecuario/",
            "https://www.em.com.br/opiniao/",
            "https://www.em.com.br/ciencia/",
            "https://www.em.com.br/praentender/",
            "https://www.em.com.br/podcasts/",
            "https://www.em.com.br/saboresdeminas/",
            "https://www.em.com.br/divirta-se/",
            "https://www.em.com.br/especiais/",
            "https://www.em.com.br/emprego/",
            "https://www.em.com.br/pensar/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=[f".*({self.date_allow_str}).*,\d+\/.*.shtm"], deny_re=[]
        )

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://www.em.com.br/sitemap.xml",
            "https://www.em.com.br/sitemapnews.xml",
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
            root_xpath='//div[contains(@itemprop, "articleBody")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "read-more"),
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
