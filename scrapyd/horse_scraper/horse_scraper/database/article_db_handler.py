from typing import Tuple, List, Iterator, Union, Callable, Any, cast

import os
from datetime import datetime
from urllib.parse import urlparse, ParseResult

import psycopg2  # type: ignore
import psycopg2.extras  # type: ignore

import logging

from horse_scraper.items import Article
from horse_scraper.spiders.article.model import ArticleSourceInfo


class ArticleDbHandler(object):
    def get_db_connection(self) -> Any:
        server = os.environ.get("DB_SERVER")
        port = os.environ.get("DB_PORT")
        db_name = os.environ.get("DB_NAME")
        user = os.environ.get("DB_USER")
        password = os.environ.get("DB_PASSWORD")

        return psycopg2.connect(
            user=user, password=password, host=server, port=port, database=db_name,
        )

    def persist(self, item: Article, keep_query_string: bool) -> Union[Article, None]:

        if self.is_article_already_persisted(
            item["url"], item["source_id"], keep_query_string
        ):
            logging.info("Article already persisted --> skipping.")
            logging.info("")
            return item

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        article_source_id = f"'{item['source_id']}'"

        url = f"'{self.sanitize_url(item['url'], keep_query_string)}'"

        title = (
            f"'{self.sanitize_value(item['title'])}'"
            if item["title"] is not None
            else "NULL"
        )

        text = (
            f"'{self.sanitize_value(item['text'])}'"
            if item["text"] is not None
            else "NULL"
        )

        if item["last_updated"] is not None:
            last_updated = (
                "'"
                + self.sanitize_value(
                    item["last_updated"].strftime("%Y/%m/%d %H:%M:%S")
                )
                + "'"
            )
        else:
            last_updated = "NULL"

        scraped_at = (
            "'"
            + self.sanitize_value(datetime.utcnow().strftime("%Y/%m/%d %H:%M:%S"))
            + "'"
        )

        spider_name = (
            "'" + self.sanitize_value(item["spider_name"]) + "'"
            if item["spider_name"] is not None
            else "NULL"
        )

        parse_function = (
            "'" + self.sanitize_value(item["parse_function"]) + "'"
            if item["parse_function"] is not None
            else "NULL"
        )

        result = f"'{self.sanitize_value(item['result'])}'"

        error = (
            f"'{self.sanitize_value(item['error'])}'"
            if item["error"] is not None
            else "NULL"
        )

        error_details = (
            f"'{self.sanitize_value(item['error_details'])}'"
            if item["error_details"] is not None
            else "NULL"
        )

        # Delete if exists (this occurs if prior result was error)
        sql = f"""
                DELETE FROM
		                scraper.article_scraping_details AS asd
                WHERE
		                asd.article_id IN (	SELECT id FROM scraper.article	WHERE url = {url} )
                """

        cursor.execute(sql)

        sql = f"""
                DELETE FROM
		                scraper.article AS article
                WHERE
                        article.id IN (	SELECT id FROM scraper.article	WHERE url = {url} )
                """

        cursor.execute(sql)

        # Insert new data
        sql = f"""
                INSERT INTO 
                        scraper.article(
                            url, 
                            title, 
                            text, 
                            last_updated, 
                            article_source_id
                        )
                        VALUES (
                            {url},
                            {title},
                            {text},
                            {last_updated},
                            {article_source_id}
                        )
                        RETURNING id
                """

        cursor.execute(sql)

        article_id = cursor.fetchone()[0]

        sql = f"""
                INSERT INTO 
                        scraper.article_scraping_details(
                            scraped_at, 
                            parse_function, 
                            result, 
                            error, 
                            error_details,
                            article_spider_id,
                            article_id
                        )
                        VALUES (
                            {scraped_at},
                            {parse_function},
                            {result},
                            {error},
                            {error_details},
                            (
                                SELECT 
                                        id 
                                FROM 
                                        scraper.article_spider 
                                WHERE 
                                        name = {spider_name} 
                                LIMIT 1
                            ),
                            '{article_id}'
                        )
                """

        cursor.execute(sql)

        cnxn.commit()

        # Close de connection
        cnxn.close()

        return None

    def is_article_already_persisted(
        self, url: str, article_source_id: str, keep_query_string: bool
    ) -> bool:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        url = self.sanitize_url(url, keep_query_string)

        sql = f"""
                SELECT
                        article.id
                FROM
                        scraper.article AS article
                        INNER JOIN scraper.article_scraping_details AS details
                            ON details.article_id = article.id
                WHERE
                        article_source_id = '{article_source_id}'
                        AND url LIKE '%{url}'
                        AND details.result = 'success'

                """
        cursor.execute(sql)
        rows = cursor.fetchall()

        # Close de connection
        cnxn.close()

        return len(rows) > 0

    def get_already_persisted_articles(
        self, urls: List[str], article_source_id: str, keep_query_string: bool,
    ) -> List[str]:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # Create temp table
        sql = f"""
                CREATE TEMP TABLE temp_articles_to_check(
                    id INT,
                    url TEXT                    
                )
                """
        cursor.execute(sql)

        # Map urls to values str
        values: List[str] = []

        for id in range(len(urls)):
            url = self.sanitize_url(urls[id], keep_query_string)
            values.append(f"('{id}', '{url}')")

        # Populate temp table
        for values_str in values:
            sql = f"""
                    INSERT INTO temp_articles_to_check(
                        id,
                        url
                    )
                    VALUES {values_str}
                    """
            cursor.execute(sql)

        # Join with persisted articles table and get existing urls
        sql = f"""
                SELECT 
                        t.id as id
                FROM 
                        temp_articles_to_check AS t
                        INNER JOIN scraper.article AS article                            
                            ON t.url like '%' || article.url
                WHERE
                        article.article_source_id = '{article_source_id}'
                """
        cursor.execute(sql)
        cnxn.commit()

        rows = cursor.fetchall()

        # Close de connection
        cnxn.close()

        fetched_ids = list(map(lambda i: i["id"], rows))

        result: List[str] = []

        for id in fetched_ids:
            result.append(urls[id])

        return result

    def get_spider_article_source_info(self, spider_name: str) -> ArticleSourceInfo:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        sql = f"""
                SELECT
                        source.id, 
                        source.name, 
                        source.country, 
                        source.url, 
                        source.category, 
                        source.tier, 
                        source.reach, 
                        source.ad_value_base, 
                        source.ad_value_500, 
                        source.ad_value_300, 
                        source.ad_value_180, 
                        source.ad_value_100
                FROM
                        scraper.article_spider AS spider
                        INNER JOIN scraper.article_source AS source
                            ON source.id = spider.article_source_id
                WHERE
                        spider.name = '{spider_name}'
                """

        cursor.execute(sql)
        data = cursor.fetchone()

        # Close de connection
        cnxn.close()

        info = ArticleSourceInfo()

        info.id = data["id"]
        info.name = data["name"]
        info.country = data["country"]
        info.url = data["url"]
        info.category = data["category"]
        info.tier = data["tier"]
        info.reach = data["reach"]
        info.ad_value_base = data["ad_value_base"]
        info.ad_value_500 = data["ad_value_500"]
        info.ad_value_300 = data["ad_value_300"]
        info.ad_value_180 = data["ad_value_180"]
        info.ad_value_100 = data["ad_value_100"]

        return info

    def sanitize_value(self, value: Union[str, None]) -> str:
        if value is None:
            return ""
        return value.replace("'", '"')

    def sanitize_url(self, url: str, keep_query_string: bool) -> str:
        url = self.sanitize_value(url)
        parse_result: ParseResult = urlparse(url)

        scheme: str = "%s://" % parse_result.scheme
        parsed: str = parse_result.geturl().replace(scheme, "", 1)

        if not keep_query_string:
            parsed = parsed.split("?")[0]

        return parsed
