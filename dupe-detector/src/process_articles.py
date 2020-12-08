from typing import List, Optional, Tuple, Iterator, Union, Callable, Any, cast

import os
import sys
from datetime import datetime
import time
from urllib.parse import urlparse, ParseResult

import psycopg2  # type: ignore
import psycopg2.extras  # type: ignore

import logging

from .doc_comparator import DocComparator
from .doc_sketch import DocSketchGenerator

# p = 20
permutations = [
    10860082479889078273,
    18146476644888601766,
    233553032589960151,
    10967695330228645662,
    6821188699044910121,
    14400788574713660870,
    9181433326940709801,
    7279614793293620057,
    9496004170356472843,
    17151808059591017054,
    10000763465023568806,
    6255463620087109822,
    9433684511981558648,
    3676517932193916746,
    17491443244268117736,
    4241833991987314871,
    1201571948985230358,
    17345635143656104241,
    9493763764167397590,
    15530938825082927871,
]


class ArticleInfo(object):
    def __init__(self, id: str, title: str, text: str, is_original: bool):
        self.id = id
        self.title = title
        self.text = text
        self.is_original = is_original

    def __str__(self):
        return f"""
        id: {self.id}
        title: {self.title}
        text: {self.text}
        is_duplicate: {str(self.is_original)}

        """


def get_db_connection() -> Any:
    server = os.environ.get("DB_SERVER")
    port = os.environ.get("DB_PORT")
    db_name = os.environ.get("DB_NAME")
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")

    return psycopg2.connect(
        user=user, password=password, host=server, port=port, database=db_name,
    )


def process_articles():

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.FileHandler("/var/log/debug.log"),
            logging.StreamHandler(sys.stdout),
        ],
    )

    logging.info(
        "Processing articles ------------------------------------------------------"
    )
    logging.info("")

    doc_sketch_generator = DocSketchGenerator(31, 2 ** 64, permutations, 3, 1600)
    ARTICLES_BATCH_SIZE = 200
    ARTICLES_COUNT_LOG = 50
    HASH_OFFSET = 2 ** 63
    POLING_INTERVAL_MIN = 2

    cnxn1 = get_db_connection()
    cnxn2 = get_db_connection()
    cursor1 = cnxn1.cursor()
    cursor2 = cnxn2.cursor()

    while True:
        time1 = time.time()

        # Get total number of articles to be processed
        sql = f"""
            SELECT 
                    COUNT(id)
            FROM 
                    scraper.article
            WHERE 
                    is_duplicate IS NULL
                    AND result = 'success'
            """

        cursor1.execute(sql)
        total_articles = cursor1.fetchone()[0]
        processed_articles_count = 0
        complete_percent_str = "{:.2f}".format(0)
        articles_per_sec_str = "{:.2f}".format(0)
        timespan_processed_articles_count = 0

        if total_articles == 0:
            # There are no articles to be processed --> wait and check again
            time.sleep(60 * POLING_INTERVAL_MIN)
            continue

        print("")
        print(f">> Found {total_articles} articles to be processed")
        print("")

        while True:
            sql = f"""
                    SELECT
                            id, 
                            date,
                            title,
                            text,
                            article_source_id
                    FROM
                            scraper.article article
                    WHERE
                            is_duplicate IS NULL
                            AND result = 'success'
                    ORDER BY
                            date,
                            id
                    LIMIT 
                            {ARTICLES_BATCH_SIZE}
                    """

            cursor1.execute(sql)

            # All done --> finish
            if cursor1.rowcount == 0:
                break

            # Iterate the article list
            for row in cursor1:

                # Calculate stats
                processed_articles_count += 1
                complete_percent_str = "{:.2f}".format(
                    100 * processed_articles_count / total_articles
                )

                if processed_articles_count % ARTICLES_COUNT_LOG == 0:
                    delta_time_sec = time.time() - time1
                    timespan_processed_articles_count += ARTICLES_COUNT_LOG

                    if delta_time_sec >= 60:
                        articles_per_sec_str = "{:.2f}".format(
                            timespan_processed_articles_count / delta_time_sec
                        )
                        time1 = time.time()
                        timespan_processed_articles_count = 0

                    date_str = row[1]
                    logging.info(
                        f"[{complete_percent_str}% complete] Article date: {date_str}, processed articles: {processed_articles_count}/{total_articles} at {articles_per_sec_str} [articles/sec]"
                    )

                # concatenate title and text
                article_id = row[0]
                date = row[1]
                title = row[2]
                text = row[3]
                article_source_id = row[4]

                # Generate sketch
                doc = title + " " + text
                sketch = doc_sketch_generator.generate_sketch(doc)
                hashes = [str(h - HASH_OFFSET) for h in sketch]

                if len(hashes) == 0:
                    logging.info(
                        f"[{complete_percent_str}% complete] Article sketch is empty ({article_id}): doc='{doc}', setting it as original."
                    )
                    # Update article
                    update_article(cursor2, cnxn2, article_id, "false", article_id)
                    continue

                hashes_str = ", ".join(hashes)
                values_str = ", ".join(
                    map(
                        lambda h: f"('{article_id}', {h}, '{date}', '{article_source_id}')",
                        hashes,
                    )
                )

                # Persist sketch
                sql = f"""
                        INSERT INTO 
                                scraper.article_sketch(
                                    article_id,
                                    hash,
                                    date,
                                    article_source_id
                                )
                                VALUES {values_str};
                        """

                cursor2.execute(sql)
                cnxn2.commit()

                # Find dupe candidates
                sql = f"""
                        WITH data as (
                            SELECT
                                    article_id,
                                    COUNT(id) c

                            FROM
                                    scraper.article_sketch
                            WHERE
                                    hash IN ({hashes_str})
                                    AND article_source_id = '{article_source_id}'
                                    AND ABS(date - '{date}') <= 2
                            GROUP BY
                                    article_id
                            ORDER BY
                                    c DESC
                        )
                        SELECT
                                article.id,
                                article.title,
                                article.text,
                                article.is_duplicate
                        FROM
                                data
                                INNER JOIN scraper.article article
                                    ON data.article_id = article.id
                        WHERE
                                c > 15
                        """

                cursor2.execute(sql)
                candidates_rows = cursor2.fetchall()

                # Analyze candidates

                is_duplicate_str = "false"
                original_article_id_str = article_id

                # The threshold is 1 because current article's
                # hashes has already been persisted.
                if len(candidates_rows) > 1:

                    # Candidates found --> check duplicates.
                    article = None
                    candidates: List[ArticleInfo] = []

                    # Populate candidates list
                    for i, row in enumerate(candidates_rows):
                        id = row[0]
                        title = row[1]
                        text = row[2]
                        # The candidate is considered as an original only if is_duplicate = false
                        # NULL values are interpreted as not originals by default
                        is_original = row[3] == False

                        if id == article_id:
                            article = ArticleInfo(id, title, text, is_original)
                        else:
                            candidates.append(ArticleInfo(id, title, text, is_original))

                    if article is None:
                        logging.info(
                            "ERROR: Considered article not found. id:" + article_id
                        )
                    else:

                        logging.info(
                            f">> Duplicate candidates found for article ({article_id}): {str(len(candidates_rows)-1)}"
                        )

                        original = find_original(article, candidates)

                        if original is not None:
                            # Original found
                            logging.info(
                                "---------------------------------------------------------------------------------------------------------------"
                            )
                            logging.info(
                                f">> Original found for article ({article_id}): {original.id}"
                            )
                            logging.info(
                                "---------------------------------------------------------------------------------------------------------------"
                            )
                            is_duplicate_str = "true"
                            original_article_id_str = original.id
                        else:
                            # Original not found --> set article as original
                            is_duplicate_str = "false"
                            original_article_id_str = article_id

                else:
                    # Candidates not found --> set article as original
                    is_duplicate_str = "false"
                    original_article_id_str = article_id

                # Update article
                update_article(
                    cursor2,
                    cnxn2,
                    article_id,
                    is_duplicate_str,
                    original_article_id_str,
                )


def update_article(
    cursor, cnxn, article_id: str, is_duplicate_str: str, original_article_id_str: str
):
    sql = f"""
            UPDATE 
                    scraper.article
            SET 
                    is_duplicate={is_duplicate_str}, 
                    original_article_id='{original_article_id_str}'
            WHERE
                    id='{article_id}'
            """
    cursor.execute(sql)
    cnxn.commit()


# Returns original article info if exists, None if not
def find_original(
    article: ArticleInfo, candidates: List[ArticleInfo]
) -> Union[ArticleInfo, None]:

    dc = DocComparator(3, 1600, 0.95)

    doc1 = article.title + " " + article.text

    for candidate in candidates:
        # Ignore non-originals
        if candidate.is_original == False:
            continue
        doc2 = candidate.title + " " + candidate.text
        if dc.compare_docs(doc1, doc2):
            return candidate

    return None


process_articles()
