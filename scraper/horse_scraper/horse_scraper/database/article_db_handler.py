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
        if self.is_article_already_persisted(item["url"]):
            logging.info("Article already persisted --> skipping.")
            logging.info("")
            return item

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        source_name = f"'{self.sanitize_value(item['source_name'])}'"

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
                    scraped_articles
                WHERE
                    url = {url}

                """

        cursor.execute(sql)
        cnxn.commit()

        # Insert new data
        sql = f"""
                INSERT INTO 
                        scraped_articles (
                            source_name,
                            url,
                            title,
                            text,
                            last_updated,
                            scraped_at,
                            spider_name,
                            parse_function,
                            result,
                            error,
                            error_details
                        )
                        VALUES
                        (
                            {source_name},
                            {url},
                            {title},
                            {text},
                            {last_updated},
                            {scraped_at},
                            {spider_name},
                            {parse_function},
                            {result},
                            {error},
                            {error_details}
                        )    
                """

        cursor.execute(sql)
        cnxn.commit()

        return None

    def is_article_already_persisted(self, url: str) -> bool:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        url = self.sanitize_value(url)
        url = self.sanitize_url(url)

        sql = f"""
                SELECT 
                        id,
                        result
                FROM
                        scraped_articles
                WHERE
                        url LIKE '%{url}'
                        AND result = 'success'
                """

        cursor.execute(sql)
        rows = cursor.fetchall()

        return len(rows) > 0

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
