from enum import Enum
from datetime import datetime


class ArticleData:
    title: str
    text: str
    last_updated: datetime

    def __init__(self, title: str, text: str, last_updated: datetime):
        self.title = title
        self.text = text
        self.last_updated = last_updated


class SpiderType(Enum):
    CRAWL = "crawl"
    SITEMAP = "sitemap"


class SpiderScheduleArgs:
    period_days_back: int
