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
            concat_fn=lambda year, month, day: f"/{year}-{month}-{day}/",
        )

    # Common params
    def _get_spider_base_name(self) -> str:
        return "es__el_pais"

    def get_allowed_domains(self) -> List[str]:
        return ["elpais.com"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            # ESP
            "https://elpais.com/",
            "https://elpais.com/internacional/",
            "https://elpais.com/opinion/",
            "https://elpais.com/espana/",
            "https://elpais.com/economia/",
            "https://elpais.com/sociedad/",
            "https://elpais.com/educacion/",
            "https://elpais.com/clima-y-medio-ambiente/",
            "https://elpais.com/ciencia/",
            "https://elpais.com/tecnologia/",
            "https://elpais.com/cultura/",
            "https://elpais.com/deportes/",
            "https://elpais.com/television/",
            "https://elpais.com/gente/",
            # AME
            "https://elpais.com/america/",
            "https://elpais.com/internacional/",
            "https://elpais.com/opinion/",
            "https://elpais.com/america/sociedad/",
            "https://elpais.com/america/economia/",
            "https://elpais.com/ciencia/",
            "https://elpais.com/tecnologia/",
            "https://elpais.com/cultura/",
            "https://elpais.com/deportes/",
            "https://elpais.com/america/estilo/",
            # MEX
            "https://elpais.com/mexico/",
            "https://elpais.com/mexico/actualidad/",
            "https://elpais.com/mexico/opinion/",
            "https://elpais.com/mexico/sociedad/",
            "https://elpais.com/mexico/economia/",
            # BRA
            "https://brasil.elpais.com/",
            "https://brasil.elpais.com/seccion/brasil/",
            "https://brasil.elpais.com/seccion/internacional/",
            "https://brasil.elpais.com/seccion/opiniao/",
            "https://brasil.elpais.com/seccion/economia/",
            "https://brasil.elpais.com/seccion/cultura/",
            "https://brasil.elpais.com/seccion/ciencia/",
            "https://brasil.elpais.com/seccion/esportes/",
            "https://brasil.elpais.com/seccion/estilo/",
            "https://brasil.elpais.com/seccion/tecnologia/",
            "https://brasil.elpais.com/seccion/eps",
            # CAT
            "https://cat.elpais.com/",
            "https://cat.elpais.com/seccion/internacional",
            "https://cat.elpais.com/seccion/opinion",
            "https://cat.elpais.com/seccion/espana",
            "https://cat.elpais.com/seccion/catalunya",
            "https://cat.elpais.com/seccion/economia",
            "https://cat.elpais.com/seccion/ciencia",
            "https://cat.elpais.com/seccion/tecnologia",
            "https://cat.elpais.com/seccion/cultura",
            "https://cat.elpais.com/seccion/estilo",
            "https://cat.elpais.com/seccion/deportes",
            # ENG
            "https://english.elpais.com/",
            "https://english.elpais.com/news/spanish_news/",
            "https://english.elpais.com/news/politics/",
            "https://english.elpais.com/news/politics/catalonia_independence/",
            "https://english.elpais.com/news/society/",
            "https://english.elpais.com/news/international/",
            "https://english.elpais.com/news/economy_and_business/",
            "https://english.elpais.com/news/opinion/",
            "https://english.elpais.com/news/arts/",
            "https://english.elpais.com/news/el_viajero/",
            "https://english.elpais.com/news/spanish_way_of_life/",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str}).*.htm"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return []

    def get_rss_urls(self) -> List[str]:
        return [
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
            "http://ep00.epimg.net/rss/cat/portada.xml",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/america/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/brasil.elpais.com/portada",
            "http://ep00.epimg.net/rss/tags/ultimas_noticias.xml",
            "http://ep00.epimg.net/rss/tags/noticias_mas_vistas.xml",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada",
            "http://elpais.com/tag/rss/latinoamerica/a/",
            "http://elpais.com/tag/rss/mexico/a/",
            "http://elpais.com/tag/rss/europa/a/",
            "http://elpais.com/tag/rss/estados_unidos/a/",
            "http://elpais.com/tag/rss/oriente_proximo/a/",
            "http://ep00.epimg.net/rss/elpais/opinion.xml",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada",
            "http://ep00.epimg.net/rss/ccaa/andalucia.xml",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/subsection/catalunya",
            "http://ep00.epimg.net/rss/ccaa/valencia.xml",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/subsection/madrid",
            "http://ep00.epimg.net/rss/ccaa/paisvasco.xml",
            "http://ep00.epimg.net/rss/ccaa/galicia.xml",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/ciencia/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/cultura/portada",
            "http://elpais.com/tag/rss/libros/a/",
            "http://elpais.com/tag/rss/cine/a/",
            "http://elpais.com/tag/rss/musica/a/",
            "http://elpais.com/tag/rss/teatro/a/",
            "http://elpais.com/tag/rss/danza/a/",
            "http://elpais.com/tag/rss/arte/a/",
            "http://elpais.com/tag/rss/arquitectura/a/",
            "http://elpais.com/tag/rss/toros/a/",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/estilo/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/deportes/portada",
            "http://elpais.com/tag/rss/futbol/a/",
            "http://elpais.com/tag/rss/deportes_motor/a/",
            "http://elpais.com/tag/rss/baloncesto/a/",
            "http://elpais.com/tag/rss/ciclismo/a/",
            "http://elpais.com/tag/rss/tenis/a/",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/television/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/sociedad/portada",
            "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/gente/portada",
            "http://elpais.com/tag/rss/educacion/a/",
            "http://elpais.com/tag/rss/religion/a/",
            "http://elpais.com/tag/rss/salud/a",
            "http://www.elpais.com/rss/feed.html?feedId=17187",
            "http://ep00.epimg.net/rss/elpais/entrevistasdigitales.xml",
            "http://elpais.com/agr/rss/el_dia_en_imagenes/a",
            "http://elpais.com/tag/rss/albumes/a/",
            "http://ep00.epimg.net/rss/tags/o_video.xml",
            "http://elpais.com/tag/c/rss/ec7a643a2efd84d02c5948f7a9c86aa7",
            "http://ep00.epimg.net/rss/tags/a_antonio_fraguas_forges_a.xml",
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
            self.parser_2,
        ]

    def parser_1(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@itemprop,"articleBody")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
            ],
        )

        return ArticleData(title, text, last_updated)

    def parser_2(self, response):

        article_data = self.get_default_parser_results(response)

        title = article_data.title
        last_updated = article_data.last_updated

        # text ----------
        text = extract_all_text(
            response,
            root_xpath='//div[contains(@class,"article_body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "more_info"),
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
