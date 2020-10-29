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
        # Override to stop redirects
        self.dont_redirect = True

    # Common params
    def _get_spider_base_name(self) -> str:
        return "cl__america_economia"

    def get_allowed_domains(self) -> List[str]:
        return ["americaeconomia.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.americaeconomia.com/",
            "https://www.americaeconomia.com/negocios-industrias",
            "https://www.americaeconomia.com/economia-mercados",
            "https://www.americaeconomia.com/politica-sociedad",
            "https://www.americaeconomia.com/analisis-opinion",
            "https://clustersalud.americaeconomia.com/",
            "https://tecno.americaeconomia.com/",
            "https://lifestyle.americaeconomia.com/",
            "https://mba.americaeconomia.com/",
            "https://asialink.americaeconomia.com",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(
            allow_re=["americaeconomia.com\/.+\/.+"],
            deny_re=[
                "\/login",
                "\/register\/",
                "\/form$",
                "\/p\/",
                ".png$",
                "\/images\/",
                "\/account\/",
                "\/indice\/",
                "\/agenda\/",
                "\/entidades\/",
                "\/personas\/",
                "\/autores\/",
                "\/file\/",
                "\/tags\/",
                "\/categorias\/",
                "\/term\/",
                "\/auth0$",
                "\/biblioteca\/",
                "page=",
            ],
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
            self.parser_3,
            self.parser_4,
            self.parser_5,
        ]

    def parser_1(self, response):

        # For some reason, this spider does not respect the download delay --> using time.sleep
        time.sleep(DOWNLOAD_DELAY)

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        text = article_data.text

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response, root_xpath='//span[@class = "data"]', exclude_list=[],
            )
        )

        return ArticleData(title, text, last_updated)

    # reportajes-x
    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@itemprop, "articleBody")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionadas"),
            ],
        )

        # last_updated
        last_updated = dateparser.parse(
            response.xpath("//time/@datetime").extract()[0],
        )

        return ArticleData(title, text, last_updated)

    # economia-mercados
    def parser_3(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "feature-section container")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "relacionadas"),
            ],
        )

        # last_updated
        last_updated = dateparser.parse(
            extract_all_text(
                response,
                root_xpath='//span[contains(@class, "awesome-date")]',
                exclude_list=[],
            ),
            settings={"DATE_ORDER": "DMY"},
        )

        return ArticleData(title, text, last_updated)

    # asialink
    def parser_4(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "field-name-body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        # last_updated
        date_str = extract_all_text(
            response,
            root_xpath='//div[contains(@class, "awesome-date")]',
            exclude_list=[],
        )

        if date_str is None or date_str == "":
            # Article has no date, use now
            last_updated = datetime.now()
        else:
            last_updated = dateparser.parse(date_str, settings={"DATE_ORDER": "DMY"})

        return ArticleData(title, text, last_updated)

    # articulos
    def parser_5(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class,"nota-contenedor")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        # last_updated
        date_str = extract_all_text(
            response, root_xpath='//div[contains(@class,"subtitulo")]', exclude_list=[],
        )

        date_str = date_str.split("|")[1]
        last_updated = dateparser.parse(date_str, settings={"DATE_ORDER": "DMY"})

        return ArticleData(title, text, last_updated)


# Spider implementations


class CrawlSpider(BaseArticleCrawlSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.CRAWL)


class SitemapSpider(BaseArticleSitemapSpider):
    params = Params()
    name = params.get_spider_name(SpiderType.SITEMAP)
