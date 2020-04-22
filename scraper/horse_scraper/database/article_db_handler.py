import os
from datetime import datetime
from urllib.parse import urlparse
import pyodbc
import logging


class ArticleDbHandler(object):
    def get_db_connection(self):
        driver = os.environ.get('DB_DRIVER')
        server = os.environ.get('DB_SERVER')
        db_name = os.environ.get('DB_HORSE_SCRAPER_DATABASE_NAME')
        user = os.environ.get('DB_USER')
        password = os.environ.get('DB_PASSWORD')

        return pyodbc.connect(
            f"DRIVER={{{driver}}};SERVER={server};DATABASE={db_name};UID={user};PWD={password}"
        )

    def persist(self, item):
        if(self.is_article_already_persisted(item['url'])):
            logging.info('Article already persisted --> skipping.')
            logging.info('')
            return item

        cnxn = self.get_db_connection()
        cursor = cnxn.cursor()

        source_name = f"'{self.sanitize_value(item['source_name'])}'"

        url = f"'{self.sanitize_url(item['url'])}'"

        title = f"'{self.sanitize_value(item['title'])}'" \
            if item['title'] is not None else 'NULL'

        text = f"'{self.sanitize_value(item['text'])}'" \
            if item['text'] is not None else 'NULL'

        if(item['last_updated'] is not None):
            last_updated = "'" + self.sanitize_value(
                item['last_updated'].strftime("%Y/%m/%d %H:%M:%S")
            ) + "'"
        else:
            last_updated = 'NULL'

        scraped_at = "'" + self.sanitize_value(
            datetime.now().strftime("%Y/%m/%d %H:%M:%S")
        ) + "'"

        spider_name = "'" + self.sanitize_value(
            item['spider_name']
        ) + "'"  \
            if item['spider_name'] is not None else 'NULL'

        parse_function = "'" + self.sanitize_value(
            item['parse_function']
        ) + "'"  \
            if item['parse_function'] is not None else 'NULL'

        result = f"'{self.sanitize_value(item['result'])}'"

        error = f"'{self.sanitize_value(item['error'])}'" \
            if item['error'] is not None else 'NULL'

        error_details = f"'{self.sanitize_value(item['error_details'])}'" \
            if item['error_details'] is not None else 'NULL'

        # Delete if exists (this occurs if prior result was error)
        sql = (f"""
                DELETE FROM 
                    scraped_articles
                WHERE
                    url = {url}

                """)

        cursor.execute(sql)
        cnxn.commit()

        # Insert new data
        sql = (f"""
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
                """)

        cursor.execute(sql)
        cnxn.commit()

    def is_article_already_persisted(self, url) -> bool:

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

    def sanitize_value(self, value):
        if value is None:
            return ''
        return value.replace("'", '"')

    def sanitize_url(self, url):
        parsed = urlparse(url)
        scheme = "%s://" % parsed.scheme
        parsed = parsed.geturl().replace(scheme, '', 1)
        parsed = parsed.split('?')[0]
        return parsed
