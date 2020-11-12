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
        return "es__el_mundo"

    def get_allowed_domains(self) -> List[str]:
        return ["elmundo.es"]

    # Crawl params

    def get_crawl_start_urls(self) -> List[str]:
        return [
            "https://www.elmundo.es/",
            "https://www.elmundo.es/espana.html",
            "https://www.elmundo.es/madrid.html",
            "https://www.elmundo.es/andalucia.html",
            "https://www.elmundo.es/andalucia/sevilla.html",
            "https://www.elmundo.es/andalucia/malaga.html",
            "https://www.elmundo.es/andalucia/el-caminante.html",
            "https://www.elmundo.es/andalucia/campus-andaluz.html",
            "https://www.elmundo.es/baleares.html",
            "https://www.elmundo.es/baleares/ibiza.html",
            "https://diariodecastillayleon.elmundo.es/",
            "https://elcorreodeburgos.elmundo.es/",
            "https://heraldodiariodesoria.elmundo.es/",
            "https://diariodevalladolid.elmundo.es/",
            "https://www.elmundo.es/catalunya.html",
            "https://www.elmundo.es/comunidad-valenciana.html",
            "https://www.elmundo.es/comunidad-valenciana/alicante.html",
            "https://www.elmundo.es/comunidad-valenciana/castellon.html",
            "https://www.elmundo.es/comunidad-valenciana/arts.html",
            "https://www.elmundo.es/pais-vasco.html",
            "https://www.elmundo.es/opinion.html",
            "https://www.elmundo.es/opinion/editorial.html",
            "https://www.elmundo.es/opinion/columnistas.html",
            "https://www.elmundo.es/blogs.html",
            "https://www.elmundo.es/economia.html",
            "https://www.elmundo.es/economia/actualidad-economica.html",
            "https://www.elmundo.es/economia/ahorro-y-consumo.html",
            "https://www.elmundo.es/economia/macroeconomia.html",
            "https://www.elmundo.es/economia/empresas.html",
            "https://www.elmundo.es/economia/vivienda.html",
            "https://www.elmundo.es/economia/innovadores.html",
            "https://comparador.elmundo.es/",
            "https://www.elmundo.es/economia/los-mas-ricos.html",
            "https://www.elmundo.es/internacional.html",
            "https://www.elmundo.es/internacional/europa.html",
            "https://www.elmundo.es/internacional/america.html",
            "https://www.elmundo.es/internacional/asia.html",
            "https://www.elmundo.es/internacional/africa.html",
            "https://www.elmundo.es/internacional/oceania.html",
            "https://www.elmundo.es/deportes.html",
            "https://www.elmundo.es/deportes/futbol.html",
            "https://www.elmundo.es/deportes/futbol/primera-division.html",
            "https://www.elmundo.es/deportes/futbol/segunda-division.html",
            "https://www.elmundo.es/deportes/futbol/champions-league.html",
            "https://www.elmundo.es/deportes/futbol/europa-league.html",
            "https://www.elmundo.es/deportes/futbol/copa-del-rey.html",
            "https://www.elmundo.es/deportes/futbol/premier-league.html",
            "https://www.elmundo.es/deportes/futbol/bundesliga.html",
            "https://www.elmundo.es/deportes/futbol/serie-a.html",
            "https://www.elmundo.es/deportes/futbol/liga-francesa.html",
            "https://www.elmundo.es/deportes/futbol/liga-portuguesa.html",
            "https://www.elmundo.es/deportes/futbol/liga-argentina.html",
            "https://www.elmundo.es/deportes/futbol/segunda-division-b.html",
            "https://www.elmundo.es/deportes/futbol/uefa-nations-league.html",
            "https://www.elmundo.es/deportes/futbol/eurocopa.html",
            "https://www.elmundo.es/deportes/futbol/futbol-femenino.html",
            "https://www.elmundo.es/deportes/baloncesto.html",
            "https://www.elmundo.es/deportes/baloncesto/liga-endesa.html",
            "https://www.elmundo.es/deportes/baloncesto/nba.html",
            "https://www.elmundo.es/deportes/baloncesto/euroliga.html",
            "https://www.elmundo.es/deportes/baloncesto/copa-del-rey.html",
            "https://www.elmundo.es/deportes/formula-1.html",
            "https://www.elmundo.es/deportes/motociclismo.html",
            "https://www.elmundo.es/deportes/tenis.html",
            "https://www.elmundo.es/deportes/tenis/open-de-australia.html",
            "https://www.elmundo.es/deportes/tenis/roland-garros.html",
            "https://www.elmundo.es/deportes/tenis/wimbledon.html",
            "https://www.elmundo.es/deportes/tenis/us-open.html",
            "https://www.elmundo.es/deportes/tenis/copa-masters/grupo-a.html",
            "https://www.elmundo.es/deportes/tenis/masters-wta-singapur/grupo-a.html",
            "https://www.elmundo.es/deportes/ciclismo.html",
            "https://www.elmundo.es/deportes/ciclismo/giro-de-italia.html",
            "https://www.elmundo.es/deportes/ciclismo/tour-de-francia.html",
            "https://www.elmundo.es/deportes/ciclismo/vuelta-a-espana.html",
            "https://www.elmundo.es/deportes/golf.html",
            "https://www.elmundo.es/deportes/boxeo.html",
            "https://www.elmundo.es/deportes/balonmano.html",
            "https://www.elmundo.es/deportes/balonmano/liga-asobal/calendario.html",
            "https://www.elmundo.es/deportes/balonmano/ehf-champions-league/grupo-a.html",
            "https://www.elmundo.es/deportes/rugby.html",
            "https://www.elmundo.es/deportes/futbol/futbol-sala.html",
            "https://www.elmundo.es/deportes/futbol-americano.html",
            "https://www.elmundo.es/deportes/padel.html",
            "https://www.elmundo.es/deportes/juegos-olimpicos.html",
            "https://www.elmundo.es/deportes/mas-deporte.html",
            "https://www.elmundo.es/deportes/mas-motor.html",
            "https://www.elmundo.es/cultura.html",
            "https://www.elmundo.es/cultura/cine.html",
            "https://www.elmundo.es/cultura/literatura.html",
            "https://www.elmundo.es/cultura/musica.html",
            "https://www.elmundo.es/cultura/teatro.html",
            "https://www.elmundo.es/cultura/arte.html",
            "https://www.elmundo.es/cultura/danza.html",
            "https://www.elmundo.es/cultura/comic.html",
            "https://www.elmundo.es/cultura/fotografia.html",
            "https://www.elmundo.es/cultura/toros.html",
            "https://www.elmundo.es/television.html",
            "https://www.elmundo.es/television/medios.html",
            "https://www.elmundo.es/television/programacion-tv/",
            "https://www.elmundo.es/television/momentvs.html",
            "https://www.elmundo.es/television/series.html",
            "https://www.elmundo.es/ciencia-y-salud.html",
            "https://www.elmundo.es/ciencia-y-salud/ciencia.html",
            "https://www.elmundo.es/ciencia-y-salud/salud.html",
            "https://segurossalud.elmundo.es/",
            "https://www.elmundo.es/tecnologia.html",
            "https://www.elmundo.es/tecnologia/gadgets.html",
            "https://www.elmundo.es/tecnologia/trucos.html",
            "https://www.elmundo.es/tecnologia/creadores.html",
            "https://www.elmundo.es/tecnologia/videojuegos.html",
            "https://www.elmundo.es/tecnologia/innovacion.html",
            "https://www.elmundo.es/loc.html",
        ]

    def get_url_filter(self) -> UrlFilter:
        return UrlFilter(allow_re=[f".*({self.date_allow_str}).+.html"], deny_re=[])

    # Sitemap params

    def get_sitemap_urls(self) -> List[str]:
        return []

    def get_rss_urls(self) -> List[str]:
        return [
            "http://estaticos.elmundo.es/elmundo/rss/portada.xml",
            "http://estaticos.elmundo.es/elmundo/rss/espana.xml",
            "http://estaticos.elmundo.es/elmundo/rss/internacional.xml",
            "http://estaticos.elmundo.es/elmundo/rss/union_europea.xml",
            "http://estaticos.elmundo.es/elmundo/rss/economia.xml",
            "http://estaticos.elmundo.es/elmundo/rss/cultura.xml",
            "http://estaticos.elmundo.es/elmundo/rss/ciencia.xml",
            "http://estaticos.elmundo.es/elmundo/rss/madrid.xml",
            "http://estaticos.elmundo.es/elmundo/rss/barcelona.xml",
            "http://estaticos.elmundo.es/elmundo/rss/baleares.xml",
            "http://estaticos.elmundo.es/elmundo/rss/castillayleon.xml",
            "http://estaticos.elmundo.es/elmundo/rss/leon.xml",
            "http://estaticos.elmundo.es/elmundo/rss/valladolid.xml",
            "http://estaticos.elmundo.es/elmundo/rss/valencia.xml",
            "http://estaticos.elmundo.es/elmundo/rss/alicante.xml",
            "http://estaticos.elmundo.es/elmundo/rss/castellon.xml",
            "http://estaticos.elmundo.es/elmundo/rss/paisvasco.xml",
            "http://estaticos.elmundo.es/elmundo/rss/andalucia.xml",
            "http://estaticos.elmundo.es/elmundo/rss/andalucia_sevilla.xml",
            "http://estaticos.elmundo.es/elmundo/rss/andalucia_malaga.xml",
            "http://estaticos.elmundo.es/elmundo/rss/solidaridad.xml",
            "http://estaticos.elmundo.es/elmundo/rss/comunicacion.xml",
            "http://estaticos.elmundo.es/elmundo/rss/television.xml",
            "http://estaticos.elmundo.es/elmundo/rss/suvivienda.xml",
            "http://estaticos.elmundo.es/elmundo/rss/navegante.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/el-gadgetoblog/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/catalejo/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/mundoplayer/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/abogado_navegante/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/aypad/index.xml",
            "http://estaticos.elmundo.es/elmundo/rss/blogs/palabrasarchivadas.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/consejoeditorial/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/dragolandia/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/elblogdesantiagogonzalez/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/elmundopordentro/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/lapurezaestaenlamezcla/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/lafotodelasemana/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/blogdepecho/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/elradar/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/rockandblog/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/nodoycredito/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/cocinandopalabras/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/elvientosopladondequiere/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/escorpion/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/desde_el_mas_alla/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/lacuadrilla/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/lahoradelaverdad/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/lavueltalamundo/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/teletridente/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/asesinoenserie/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/corazondemelon/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/sinnoticiasdedior/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/camaredonda/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/clima/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/cosmos/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/sapiens/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/verde/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/tierra/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/ciudadanom/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/madridbajosfondos/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/atodanoche/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/ciudadanobarcelona/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/ciudadanobaleares/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/archipielago_gulasch/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/ciudadanovalencia/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/ciudadanocastillayleon/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/cronicasdesdeeuropa/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/cronicasdesdeeeuu/index.xml",
            "http://estaticos.elmundo.es/elmundo/rss/blogs/cronicasdesdeafrica.xml",
            "http://estaticos.elmundo.es/elmundo/rss/blogs/lapurezaestaenlamezcla.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/orienteproximo/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/cronicasdesdeasia/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/cronicasdesdelatinoamerica/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/chinavirtual/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/habaname/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/europa_atirodeblog/index.xml",
            "http://estaticos.elmundo.es/blogs/elmundo/hemisferioxx/index.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/portada.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/futbol.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/baloncesto.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/ciclismo.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/golf.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/tenis.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/motor.xml",
            "http://estaticos.elmundo.es/elmundodeporte/rss/masdeporte.xml",
            "http://estaticos.elmundo.es/elmundosalud/rss/portada.xml",
            "http://estaticos.elmundo.es/elmundomotor/rss/portada.xml",
            "http://estaticos.elmundo.es/yodona/rss/portada.xml",
            "http://estaticos.elmundo.es/yodona/rss/blogs/cuentahilos.xml",
            "http://estaticos.elmundo.es/yodona/rss/blogs/modamania.xml",
            "http://estaticos.elmundo.es/yodona/rss/blogs/grandclass.xml",
            "http://estaticos.elmundo.es/elmundo/rss/videos.xml",
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
            root_xpath='//div[contains(@class,"article__body")]',
            exclude_list=[
                (AttributeType.NAME, "script"),
                (AttributeType.NAME, "style"),
                (AttributeType.CLASS, "subtitles"),
                (AttributeType.CLASS, "article__trust"),
                (AttributeType.CLASS, "article__tags"),
                (AttributeType.CLASS, "related"),
                (AttributeType.CLASS, "popular-links"),
                (AttributeType.CLASS, "share"),
                (AttributeType.CLASS, "premium"),
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
