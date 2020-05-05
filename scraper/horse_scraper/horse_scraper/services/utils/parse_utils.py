from typing import Tuple, List, Dict, Iterator, Union, Callable, cast
from enum import Enum
from collections import namedtuple

import scrapy  # type: ignore
from scrapy.http import Request, HtmlResponse  # type: ignore


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
