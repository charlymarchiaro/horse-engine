from typing import Tuple, List, Dict, Iterator, Union, Callable, cast
from datetime import date

from scrapy.http import Request, HtmlResponse  # type: ignore

from newspaper import Article  # type: ignore
from horse_scraper.services.utils.parse_utils import get_publishing_date

from horse_scraper.spiders.article.model import (
    ArticleSourceInfo,
    ArticleData,
    DateSpan,
)


class DefaultArticleParser:
    def parse(
        self,
        response: HtmlResponse,
        date_span: DateSpan,
        source_info: ArticleSourceInfo,
        splash_enabled: bool,
    ) -> ArticleData:

        article = Article(response.url)
        article.set_html(response.body)
        locale_date_order = get_locale_date_order(source_info.country)

        article.parse()

        title = article.title
        if title:
            title = title.replace("\n", "||")

        text = article.text
        if text:
            text = text.replace("\n", "||")

        last_updated = get_publishing_date(
            response.url, article, date_span, locale_date_order
        )

        return ArticleData(title, text, last_updated)


def get_locale_date_order(country: str) -> str:

    country = country.lower()

    LOCALE_DATE_ORDER_DICT: Dict[str, str] = {
        "argentina": "DMY",
        "brasil": "DMY",
        "españa": "DMY",
        "méxico": "DMY",
        "uruguay": "DMY",
        "colombia": "DMY",
        "ecuador": "DMY",
        "chile": "DMY",
        "perú": "DMY",
        "paraguay": "DMY",
        "bolivia": "DMY",
        "venezuela": "DMY",
    }

    if not country in LOCALE_DATE_ORDER_DICT:
        return "YMD"

    return LOCALE_DATE_ORDER_DICT[country.lower()]
