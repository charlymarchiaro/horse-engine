# -*- coding: utf-8 -*-

import os
from shutil import which


# Scrapy settings for horse_scraper project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = "horse_scraper"

SCRAPYD_NODE_ID = str(os.environ.get("SCRAPYD_NODE_ID") or "(None)")

SPIDER_MODULES = [
    "horse_scraper.spiders.article.impl",
]
NEWSPIDER_MODULE = "horse_scraper.spiders"


# Crawl responsibly by identifying yourself (and your website) on the user-agent
# USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
USER_AGENT = (
    os.environ.get("USER_AGENT")
    or "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36"
)
DEFAULT_REQUEST_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent": USER_AGENT,
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,*",
}

# Obey robots.txt rules
# ROBOTSTXT_OBEY = True

# Configure maximum concurrent requests performed by Scrapy (default: 16)
# CONCURRENT_REQUESTS = 32

# Configure a delay for requests for the same website (default: 0)
# See https://docs.scrapy.org/en/latest/topics/settings.html#download-delay
# See also autothrottle settings and docs
DOWNLOAD_DELAY = int(os.environ.get("DOWNLOAD_DELAY") or 3)
# The download delay setting will honor only one of:
CONCURRENT_REQUESTS_PER_DOMAIN = int(
    os.environ.get("CONCURRENT_REQUESTS_PER_DOMAIN") or 1
)
# CONCURRENT_REQUESTS_PER_IP = 16

# Disable cookies (enabled by default)
COOKIES_ENABLED = os.environ.get("COOKIES_ENABLED") == "True" or False

REDIRECT_ENABLED = os.environ.get("REDIRECT_ENABLED") == "True" or True

# Disable Telnet Console (enabled by default)
# TELNETCONSOLE_ENABLED = False

# Override the default request headers:
# DEFAULT_REQUEST_HEADERS = {
#   'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
#   'Accept-Language': 'en',
# }

# Enable or disable spider middlewares
# See https://docs.scrapy.org/en/latest/topics/spider-middleware.html
SPIDER_MIDDLEWARES = {
    "scrapy_splash.SplashDeduplicateArgsMiddleware": 100,
    # "horse_scraper.middlewares.HorseScraperSpiderMiddleware": 543,
}

# Scrapoxy
SCRAPOXY_IP_ADDRESS = os.environ.get("SCRAPOXY_IP_ADDRESS") or ""
PROXY_SCRAPOXY_PASSWORD = os.environ.get("SCRAPOXY_PASSWORD")

PROXY_SCRAPOXY_PATH = SCRAPOXY_IP_ADDRESS
if PROXY_SCRAPOXY_PASSWORD is not None:
    PROXY_SCRAPOXY_PATH = f"scrapoxy:{PROXY_SCRAPOXY_PASSWORD}@{SCRAPOXY_IP_ADDRESS}"

PROXY = f"http://{PROXY_SCRAPOXY_PATH}:8888/?noconnect"
API_SCRAPOXY = f"http://{SCRAPOXY_IP_ADDRESS}:8889/api"
API_SCRAPOXY_PASSWORD = os.environ.get("SCRAPOXY_PASSWORD") or ""


# Enable or disable downloader middlewares
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
DOWNLOADER_MIDDLEWARES = {
    "scrapy_splash.SplashCookiesMiddleware": 723,
    "scrapy_splash.SplashMiddleware": 725,
    "scrapoxy.downloadmiddlewares.proxy.ProxyMiddleware": 750,
    "scrapoxy.downloadmiddlewares.wait.WaitMiddleware": 751,
    # "scrapoxy.downloadmiddlewares.scale.ScaleMiddleware": 752,
    "scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware": None,
    "scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware": 810,
    # "horse_scraper.middlewares.HorseScraperDownloaderMiddleware": 900,
}

# Enable or disable extensions
# See https://docs.scrapy.org/en/latest/topics/extensions.html
# EXTENSIONS = {
#    'scrapy.extensions.telnet.TelnetConsole': None,
# }

# Configure item pipelines
# See https://docs.scrapy.org/en/latest/topics/item-pipeline.html
ITEM_PIPELINES = {
    "horse_scraper.pipelines.HorseScraperPipeline": 300,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
# AUTOTHROTTLE_ENABLED = True
# The initial download delay
# AUTOTHROTTLE_START_DELAY = 5
# The maximum download delay to be set in case of high latencies
# AUTOTHROTTLE_MAX_DELAY = 60
# The average number of requests Scrapy should be sending in parallel to
# each remote server
# AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
# AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
# HTTPCACHE_ENABLED = True
# HTTPCACHE_EXPIRATION_SECS = 0
# HTTPCACHE_DIR = 'httpcache'
# HTTPCACHE_IGNORE_HTTP_CODES = []
# HTTPCACHE_STORAGE = 'scrapy.extensions.httpcache.FilesystemCacheStorage'

# Splash
SPLASH_URL = os.environ.get("SPLASH_URL")
DUPEFILTER_CLASS = "scrapy_splash.SplashAwareDupeFilter"
HTTPCACHE_STORAGE = "scrapy_splash.SplashAwareFSCacheStorage"


FEED_EXPORT_ENCODING = "utf-8"

LOG_LEVEL = os.environ.get("SCRAPYD_LOG_LEVEL") or "DEBUG"

# App params
CRAWL_PERIOD_DAYS_BACK = int(os.environ.get("PERIOD_DAYS_BACK") or 15)
SITEMAP_PERIOD_DAYS_BACK = int(os.environ.get("PERIOD_DAYS_BACK") or 15)
CRAWL_MAX_RUN_TIME_HOURS = int(os.environ.get("MAX_RUN_TIME_HOURS") or 6)
SITEMAP_MAX_RUN_TIME_HOURS = int(os.environ.get("MAX_RUN_TIME_HOURS") or 6)

