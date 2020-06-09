"""
Modified by Charly Marchiaro (jun 2020) to include custom date params

---

Module for processing Sitemaps.

Note: The main purpose of this module is to provide support for the
SitemapSpider, its API is subject to change without notice.
"""

from typing import Tuple, List, Dict, Any, Iterator, Generator, Union, Callable, cast
from urllib.parse import urljoin

import lxml.etree  # type: ignore


class Sitemap(object):
    """Class to parse Sitemap (type=urlset) and Sitemap Index
    (type=sitemapindex) files"""

    def __init__(self, xmltext: str) -> None:
        xmlp = lxml.etree.XMLParser(
            recover=True, remove_comments=True, resolve_entities=False
        )
        self._root = lxml.etree.fromstring(xmltext, parser=xmlp)
        rt = self._root.tag
        self.type = self._root.tag.split("}", 1)[1] if "}" in rt else rt

    def __iter__(self) -> Generator[Dict[str, str], None, None]:
        for elem in self._root.getchildren():

            d: Any = {}
            for el in elem.getchildren():
                tag = el.tag
                name = tag.split("}", 1)[1] if "}" in tag else tag
                if name == "link":
                    if "href" in el.attrib:
                        d.setdefault("alternate", []).append(el.get("href"))
                else:
                    d[name] = el.text.strip() if el.text else ""

            # Try to find any of the known date tags and
            # add the value to the "entry_date" key
            DATE_TAGS = ["lastmod", "publication_date"]

            for date_tag in DATE_TAGS:
                date = self.extract_elem_tag(elem, date_tag)
                if not date:
                    continue
                d.setdefault("entry_date", date)
                break

            if "loc" in d:
                yield d

    def extract_elem_tag(self, elem: Any, tag_name: str) -> Union[str, None]:
        s = elem.xpath(f'.//*[contains(local-name(), "{tag_name}")]//text()')
        if not s or len(s) < 1:
            return None

        return s[0]


def sitemap_urls_from_robots(robots_text, base_url=None):
    """Return an iterator over all sitemap urls contained in the given
    robots.txt file
    """
    for line in robots_text.splitlines():
        if line.lstrip().lower().startswith("sitemap:"):
            url = line.split(":", 1)[1].strip()
            yield urljoin(base_url, url)
