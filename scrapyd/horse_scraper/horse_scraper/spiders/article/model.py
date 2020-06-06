from typing import Optional
from enum import Enum
from datetime import datetime, date


class ArticleSourceInfo:
    id: str
    name: str
    country: str
    url: str
    category: str
    tier: int
    reach: int
    ad_value_base: int
    ad_value_500: int
    ad_value_300: int
    ad_value_180: int
    ad_value_100: int


class ArticleData:
    title: str
    text: str
    last_updated: Optional[datetime]

    def __init__(self, title: str, text: str, last_updated: Optional[datetime]) -> None:
        self.title = title
        self.text = text
        self.last_updated = last_updated


class SpiderType(Enum):
    CRAWL: str = "crawl"
    SITEMAP: str = "sitemap"


class SpiderScheduleArgs:
    period_days_back: int


class DateSpan:
    from_date_incl: date
    to_date_incl: date
