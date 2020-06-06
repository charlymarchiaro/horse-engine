from typing import Tuple, List, Dict, Iterator, Union, Callable, cast
from enum import Enum
from collections import namedtuple
import dateparser  # type: ignore
from dateutil.parser import parse as dateutil_parse  # type: ignore
from datetime import date
import re

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse  # type: ignore
import parsel  # type: ignore

import newspaper  # type: ignore

from horse_scraper.spiders.article.model import DateSpan


class AttributeType(Enum):
    NAME = "NAME"
    ID = "ID"
    CLASS = "CLASS"
    TEXT_CONTAINS = "TEXT_CONTAINS"
    TEXT_EQUALS = "TEXT_EQUALS"


def extract_all_text(
    response: HtmlResponse,
    root_xpath: str,
    exclude_list: List[Tuple[AttributeType, str]],
) -> str:

    xpath: str

    exclude_selectors: Iterator[str] = map(
        generate_xpath_exclude_selector, exclude_list
    )

    exclude_xpath = (
        "[" + " and ".join(exclude_selectors) + "]" if len(exclude_list) > 0 else ""
    )

    xpath = root_xpath + "//text()" + exclude_xpath

    extracted_lines: List[str] = response.xpath(xpath).extract()

    text = remove_whitespace_and_join(extracted_lines)

    return text


def generate_xpath_exclude_selector(exclude_item: Tuple[AttributeType, str]) -> str:

    attrib_type, value = exclude_item

    if attrib_type == AttributeType.NAME:
        return f"not(ancestor-or-self::{value})"

    elif attrib_type == AttributeType.ID:
        return f'not( ancestor-or-self::*[contains(@id, "{value}")] )'

    elif attrib_type == AttributeType.CLASS:
        return f'not( ancestor-or-self::*[contains(@class, "{value}")] )'

    elif attrib_type == AttributeType.TEXT_CONTAINS:
        return f'not( ancestor-or-self::*[contains(text(), "{value}")] )'

    elif attrib_type == AttributeType.TEXT_EQUALS:
        return f'not( ancestor-or-self::*[text() = "{value}"] )'

    else:
        raise Exception("Invalid attribute type")


def remove_whitespace_and_join(lines: List[str]) -> str:

    text: str = ""

    blank_lines_count: int = 0

    for line in lines:

        line = line.strip()

        if line.isspace() or line == "":
            blank_lines_count += 1
            continue

        delimiter: str = " " if blank_lines_count == 0 else " || "

        text += line + delimiter
        blank_lines_count = 0

    return text


def extract_schemas(text: str) -> List[str]:
    selector = parsel.Selector(text)

    return selector.xpath(
        '//text()[contains(., "schema") and contains(., "{")]'
    ).extract()


class RegexInfo:
    rex: str
    group: List[int]

    def __init__(self, rex: str, groups: List[int]):
        self.rex = rex
        self.groups = groups


# Forked ad modified from newspaper3k library:
# https://github.com/codelucas/newspaper
def get_publishing_date(
    url: str, article: newspaper.Article, date_span: DateSpan, locale_date_order: str
) -> Union[None, date]:
    """3 strategies for publishing date extraction. The strategies
        are descending in accuracy and the next strategy is only
        attempted if a preferred one fails.

        1. Pubdate from schema
        2. Pubdate from metadata
        3. Pubdate from URL
    """

    ds_params = get_datespan_params(date_span)

    # Find in schema
    print("Searching in schema:\n")

    SCHEMA_PUBDATE_REGEX: List[RegexInfo] = [
        RegexInfo('"datePublished".*?:.*?"(.+?)"', [1]),
        RegexInfo('"dateModified".*?:.*?"(.+?)"', [1]),
    ]
    schemas = extract_schemas(article.html)
    for schema in schemas:
        for regex in SCHEMA_PUBDATE_REGEX:
            date_match = re.search(regex.rex, schema)
            if date_match:
                date_str = date_match.group(regex.groups[0])
                print("matched string: " + date_str)
                datetime_obj = parse_date_str(date_str, date_span, locale_date_order)
                if datetime_obj:
                    return datetime_obj

    # Find in metadata
    print("Searching in metadata:\n")
    PUBLISH_DATE_TAGS = [
        {"attribute": "property", "value": "rnews:datePublished", "content": "content"},
        {
            "attribute": "property",
            "value": "article:published_time",
            "content": "content",
        },
        {"attribute": "name", "value": "OriginalPublicationDate", "content": "content"},
        {"attribute": "itemprop", "value": "datePublished", "content": "datetime"},
        {"attribute": "property", "value": "og:published_time", "content": "content"},
        {"attribute": "name", "value": "article_date_original", "content": "content"},
        {"attribute": "name", "value": "publication_date", "content": "content"},
        {"attribute": "name", "value": "sailthru.date", "content": "content"},
        {"attribute": "name", "value": "PublishDate", "content": "content"},
        {"attribute": "pubdate", "value": "pubdate", "content": "datetime"},
        {"attribute": "itemprop", "value": "pubdate", "content": "content"},
    ]

    doc = article.doc
    extractor = article.extractor

    for known_meta_tag in PUBLISH_DATE_TAGS:
        meta_tags = extractor.parser.getElementsByTag(
            doc, attr=known_meta_tag["attribute"], value=known_meta_tag["value"]
        )
        if meta_tags:
            date_str = extractor.parser.getAttribute(
                meta_tags[0], known_meta_tag["content"]
            )
            print("matched string: " + date_str)
            datetime_obj = parse_date_str(date_str, date_span, locale_date_order)
            if datetime_obj:
                return datetime_obj

    # Find in URL
    print("Searching in URL:\n")
    re_years_str = "|".join(map(lambda v: str(v), ds_params.years))

    url_regex_dict: Dict[str, RegexInfo] = {
        "YMD": RegexInfo(
            f"({re_years_str})(-|\/)?(\d{{2}})(-|\/)?(\d{{2}})", [1, 3, 5]
        ),
        "DMY": RegexInfo(
            f"(-|\/)?(\d{{2}})(-|\/)?(\d{{2}})({re_years_str})", [5, 3, 1]
        ),
        "MDY": RegexInfo(
            f"(-|\/)?(\d{{2}})(-|\/)?(\d{{2}})({re_years_str})", [3, 5, 1]
        ),
    }

    url_regex_list = [url_regex_dict["YMD"], url_regex_dict[locale_date_order]]

    for regex in url_regex_list:
        date_match = re.search(regex.rex, url)
        if date_match:
            year = date_match.group(regex.groups[0])
            month = date_match.group(regex.groups[1])
            day = date_match.group(regex.groups[2])
            date_str = f"{year}/{month}/{day}"

            print("matched string: " + date_str)

            datetime_obj = parse_date_str(date_str, date_span, locale_date_order)
            if datetime_obj:
                return datetime_obj

    return None


def parse_date_str(
    date_str, date_span: DateSpan, locale_date_order: str
) -> Union[None, date]:

    functions = [
        lambda ds: dateparser.parse(ds, settings={"DATE_ORDER": "YMD"}),
        lambda ds: dateparser.parse(ds, settings={"DATE_ORDER": locale_date_order}),
        lambda ds: dateutil_parse(ds),
    ]

    # Try removing 'AM/PM' as a workaround for invalid hours (i.e.: '15 PM')
    chars_to_remove = "apmAPM."
    alt_date_str_1 = date_str
    for c in chars_to_remove:
        alt_date_str_1 = alt_date_str_1.replace(c, "")

    date_strings = [date_str, alt_date_str_1]

    for ds in date_strings:
        print("-->trying ds=" + ds)
        for f in functions:
            print("-->trying f=" + str(f))
            try:
                date = f(ds)
            except (ValueError, OverflowError, AttributeError, TypeError):
                print("-->Error")
                date = None

            if date:
                print("-->Success: " + str(date))
                return date

    return None


class DateSpanParams:
    years: List[int]


def get_datespan_params(date_span) -> DateSpanParams:
    start_year = date_span.from_date_incl.year
    end_year = date_span.to_date_incl.year

    params = DateSpanParams()

    # start_year minus one to parse the date correctly,
    # even if it's outside the search period
    params.years = list(range(start_year - 1, end_year + 1))

    return params
