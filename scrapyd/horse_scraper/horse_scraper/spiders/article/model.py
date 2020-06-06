from enum import Enum
from datetime import datetime, date


class ArticleData:
    title: str
    text: str
    last_updated: datetime

    def __init__(self, title: str, text: str, last_updated: datetime) -> None:
        self.title = title
        self.text = text
        self.last_updated = last_updated


class SpiderType(Enum):
    CRAWL = "crawl"
    SITEMAP = "sitemap"


class SpiderScheduleArgs:
    period_days_back: int


class DateSpan:
    from_date_incl: date
    to_date_incl: date
