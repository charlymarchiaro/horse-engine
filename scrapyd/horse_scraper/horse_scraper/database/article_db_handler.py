from typing import Tuple, List, Iterator, Union, Callable, Any, cast

import os
from datetime import datetime
from urllib.parse import urlparse, ParseResult

import psycopg2  # type: ignore
import psycopg2.extras  # type: ignore

import logging

from horse_scraper.items import Article
from horse_scraper.settings import SCRAPYD_NODE_ID
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
            date = (
                "'"
                + self.sanitize_value(item["last_updated"].strftime("%Y/%m/%d"))
                + "'"
            )
        else:
            last_updated = "NULL"
            date = "NULL"

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

        # Delete if exists (this occurs if prior result was error)
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
                            date, 
                            article_source_id,
                            scraped_at,
                            parse_function,
                            result,
                            article_spider_id
                        )
                        VALUES (
                            {url},
                            {title},
                            {text},
                            {last_updated},
                            {date},
                            {article_source_id},
                            {scraped_at},
                            {parse_function},
                            {result},
                            (
                                SELECT 
                                        id 
                                FROM 
                                        scraper.article_spider 
                                WHERE 
                                        name = {spider_name} 
                                LIMIT 1
                            )
                        )
                        RETURNING id
                """

        cursor.execute(sql)

        article_id = cursor.fetchone()[0]

        cnxn.commit()

        # Close de connection
        cnxn.close()

        self.add_to_last_scraped_articles(item, article_id, scraped_at)

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
                WHERE
                        article_source_id = '{article_source_id}'
                        AND url = '{url}'
                        AND result = 'success'

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
                            ON t.url = article.url                            
                WHERE
                        article.article_source_id = '{article_source_id}'
                        AND article.result = 'success'
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
                        source.region, 
                        source.red_circle, 
                        source.url, 
                        source.tier, 
                        source.reach, 
                        source.ad_value_500, 
                        source.ad_value_150,
                        source.parse_category
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
        info.region = data["region"]
        info.red_circle = data["red_circle"]
        info.url = data["url"]
        info.tier = data["tier"]
        info.reach = data["reach"]
        info.ad_value_500 = data["ad_value_500"]
        info.ad_value_150 = data["ad_value_150"]
        info.parse_category = data["parse_category"]

        return info

    def add_to_last_scraped_articles(
        self, article: Article, article_id: str, scraped_at_str: str
    ) -> None:

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        if article["last_updated"] is not None:
            last_updated_str = (
                "'"
                + self.sanitize_value(
                    article["last_updated"].strftime("%Y/%m/%d %H:%M:%S")
                )
                + "'"
            )
        else:
            last_updated_str = "NULL"

        sql = f"""
                INSERT INTO 
                        scraper.article_summary(
                            id,
	                        url, 
                            title, 
                            text, 
                            last_updated, 
                            scraped_at, 
                            parse_function, 
                            result, 
                            spider_name,
                            scrapyd_node_id,
                            source_name
                        )
	                    VALUES (
                            '{article_id}',
                            '{self.sanitize_value(article['url'])}',
                            '{self.sanitize_value(article['title'])[:27] + '...'}',
                            '{self.sanitize_value(article['text'])[:27] + '...'}',
                            {last_updated_str},
                            {scraped_at_str},
                            '{self.sanitize_value(article['parse_function'])}',
                            '{self.sanitize_value(article['result'])}',
                            '{self.sanitize_value(article['spider_name'])}',
                            '{SCRAPYD_NODE_ID}',
                            (
                                SELECT 
                                        name 
                                FROM 
                                        scraper.article_source
                                WHERE 
                                        id = '{article['source_id']}'
                                LIMIT 1
                            )
                        );
                """

        cursor.execute(sql)

        sql = f"""
                DELETE FROM scraper.article_summary WHERE id NOT IN (
                    SELECT
                            id 
                    FROM 
                            scraper.article_summary
                    ORDER BY
                            scraped_at DESC
                    LIMIT 10
                )
                """

        cursor.execute(sql)

        cnxn.commit()

        # Close de connection
        cnxn.close()

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
