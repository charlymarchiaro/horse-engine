from typing import Tuple, List, Union, Callable, Any, cast

import os
from datetime import datetime
from urllib.parse import urlparse, ParseResult

import psycopg2  # type: ignore

import logging

from horse_scraper.items import Article


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

    def persist(self, item: Article) -> Union[Article, None]:

        if self.is_article_already_persisted(item["url"], item["source_id"]):
            logging.info("Article already persisted --> skipping.")
            logging.info("")
            return item

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        article_source_id = f"'{item['source_id']}'"

        url = f"'{self.sanitize_url(item['url'])}'"

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
            + self.sanitize_value(datetime.now().strftime("%Y/%m/%d %H:%M:%S"))
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

        return None

    def is_article_already_persisted(self, url: str, article_source_id: str) -> bool:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        url = self.sanitize_value(url)
        url = self.sanitize_url(url)

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

        return len(rows) > 0

    def get_spider_article_source_id(self, spider_name: str) -> str:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        sql = f"""
                SELECT
                        article_source_id
                FROM
                        scraper.article_spider AS spider
                WHERE
                        spider.name = '{spider_name}'
                """

        cursor.execute(sql)

        return cursor.fetchone()[0]

    def sanitize_value(self, value: Union[str, None]) -> str:
        if value is None:
            return ""
        return value.replace("'", '"')

    def sanitize_url(self, url) -> str:
        parse_result: ParseResult = urlparse(url)

        scheme: str = "%s://" % parse_result.scheme
        parsed: str = parse_result.geturl().replace(scheme, "", 1)
        parsed = parsed.split("?")[0]

        return parsed
