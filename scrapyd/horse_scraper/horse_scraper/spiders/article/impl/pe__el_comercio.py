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
        return "pe__el_comercio"

    def get_allowed_domains(self) -> List[str]:
        return ["elcomercio.pe"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://elcomercio.pe/",
            "https://elcomercio.pe/ultimas-noticias/",
            "https://elcomercio.pe/opinion/",
            "https://elcomercio.pe/politica/",
            "https://elcomercio.pe/economia/",
            "https://elcomercio.pe/lima/",
            "https://elcomercio.pe/peru/",
            "https://elcomercio.pe/mundo/",
            "https://elcomercio.pe/deporte-total",
            "https://elcomercio.pe/luces",
            "https://elcomercio.pe/tvmas",
            "https://elcomercio.pe/tecnologia/",
            "https://elcomercio.pe/respuestas/",
            "https://elcomercio.pe/somos/",
            "https://elcomercio.pe/viu/",
            "https://elcomercio.pe/vamos/",
            "https://elcomercio.pe/casa-y-mas/",
            "https://elcomercio.pe/ruedas-tuercas/",
            "https://elcomercio.pe/eldominical/",
            "https://elcomercio.pe/desde-la-redaccion",
            "https://elcomercio.pe/videos/",
            "https://elcomercio.pe/archivo-elcomercio/",
            "https://elcomercio.pe/blogs/",
            "https://elcomercio.pe/tecnologia/e-sports/",
            "https://elcomercio.pe/wuf/",
            "https://elcomercio.pe/publirreportaje/",
            "https://elcomercio.pe/colecciones-el-comercio/",
            "https://elcomercio.pe/las-mas-leidas/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=["elcomercio.pe\/.+\/.+-noticia(-\d+)?\/$"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return [
            "https://elcomercio.pe/sitemap/?outputType=xml",
            "https://elcomercio.pe/sitemap/politica/?outputType=xml",
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
            root_xpath='//div[contains(@class, "story-contents__content")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "story-contents__caption"),
                (AttributeType.CLASS, "story-contents__blockquote"),
                (AttributeType.CLASS, "story-contents__paragraph-list"),
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
