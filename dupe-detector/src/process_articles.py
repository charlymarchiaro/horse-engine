from typing import List, Optional, Tuple, Iterator, Union, Callable, Any, cast

import os
import sys
from datetime import datetime, timedelta
import time
from urllib.parse import urlparse, ParseResult

import psycopg2  # type: ignore
import psycopg2.extras  # type: ignore

import logging

from .doc_comparator import DocComparator
from .doc_sketch import DocSketchGenerator
from .profiler import Profiler

dir_path = os.path.dirname(os.path.realpath(__file__))

# p = 8
PERMUTATIONS = [
    1115786864,
    662436351,
    3022251224,
    4033289138,
    601754926,
    439309108,
    1343728718,
    750903223,
]
ARTICLE_HASH_BASE = 15
ARTICLE_HASH_BITS = 32
ARTICLE_HASH_OFFSET = 2 ** (ARTICLE_HASH_BITS - 1)
SHINGLE_LENGTH = 3
MAX_NUM_SHINGLES = 1600
HASH_COLLISION_THRESH = 0.4
DOC_COMPARATOR_OVERLAP_THRESH = 0.75

ARTICLE_SOURCE_ID_HASH_BASE = 15
ARTICLE_SOURCE_ID_HASH_BITS = 16
ARTICLE_SOURCE_ID_HASH_OFFSET = 2 ** (ARTICLE_SOURCE_ID_HASH_BITS - 1)

ARTICLES_BATCH_SIZE = 5000
ARTICLES_COUNT_LOG = 50
POLING_INTERVAL_MIN = 10


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
            logging.FileHandler(
                dir_path + "/log/debug.log", mode="w", encoding="utf-8"
            ),
            logging.StreamHandler(sys.stdout),
        ],
    )

    logging.info(
        f"   ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗"
    )
    logging.info(
        f">> ║                                                                                                          ║"
    )
    logging.info(
        f">> ║  Article duplicate detector                                                                              ║"
    )
    logging.info(
        f">> ║                                                                                                          ║"
    )
    logging.info(
        f"   ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝"
    )

    doc_sketch_generator = DocSketchGenerator(
        ARTICLE_HASH_BASE,
        2 ** ARTICLE_HASH_BITS,
        PERMUTATIONS,
        SHINGLE_LENGTH,
        MAX_NUM_SHINGLES,
    )
    article_source_id_hash_generator = DocSketchGenerator(
        ARTICLE_SOURCE_ID_HASH_BASE, 2 ** ARTICLE_SOURCE_ID_HASH_BITS, [], 0, 0
    )
    profiler = Profiler()

    cnxn1 = get_db_connection()
    cnxn2 = get_db_connection()
    cursor1 = cnxn1.cursor()
    cursor2 = cnxn2.cursor()

    while True:
        time1 = time.time()

        # Profiler ###############
        profiler.reg_time("t1")

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

        logging.info("")
        logging.info(f">> Found {total_articles} articles to be processed")
        logging.info("")

        # Profiler ###############
        profiler.reg_time("t2")

        while True:
            # Profiler ###############
            profiler.reg_time("t3")

            sql = f"""
                    SELECT
                            id
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

            article_id_list = list(map(lambda r: r[0], cursor1.fetchall()))

            # Iterate the article id list
            for article_id in article_id_list:
                # Profiler ###############
                profiler.reg_time("t4")

                sql = f"""
                    SELECT
                            date,
                            title,
                            text,
                            article_source_id
                    FROM
                            scraper.article article
                    WHERE
                            id = '{article_id}'
                    """

                cursor1.execute(sql)
                row = cursor1.fetchone()

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

                        profiler.log_stats()

                    date_str = row[0]
                    logging.info(
                        f">> [{complete_percent_str}% complete] Article date: {date_str}, processed articles: {processed_articles_count}/{total_articles} at {articles_per_sec_str} [articles/sec]"
                    )

                # concatenate title and text
                date = row[0]
                title = row[1]
                text = row[2]
                article_source_id = row[3]
                article_source_id_hash = (
                    article_source_id_hash_generator.get_fingerprint(article_source_id)
                    - ARTICLE_SOURCE_ID_HASH_OFFSET
                )

                # Generate sketch
                doc = title + " " + text
                sketch = doc_sketch_generator.generate_sketch(doc)
                hashes = [str(h - ARTICLE_HASH_OFFSET) for h in sketch]

                # Profiler ###############
                profiler.reg_time("t5")

                if len(hashes) == 0:
                    logging.info(
                        f">> [{complete_percent_str}% complete] Article sketch is empty ({article_id}): doc='{doc}', setting it as original."
                    )
                    # Update article
                    update_article(cursor2, cnxn2, article_id, "false", article_id)
                    continue

                hashes_str = ", ".join(hashes)
                values_str = ", ".join(
                    map(
                        lambda h: f"('{article_id}', {h}, '{date}', {article_source_id_hash})",
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
                                    article_source_id_hash
                                )
                                VALUES {values_str};
                        """

                cursor2.execute(sql)
                cnxn2.commit()

                # Profiler ###############
                profiler.reg_time("t6")

                # Find dupe candidates

                date_from = date - timedelta(days=2)
                date_to = date + timedelta(days=0)
                count_thresh = len(PERMUTATIONS) * HASH_COLLISION_THRESH

                sql = f"""
                        WITH data as (
                            SELECT
                                    article_id,
                                    COUNT(id) c

                            FROM
                                    scraper.article_sketch
                            WHERE
                                    hash IN ({hashes_str})
                                    AND article_source_id_hash = '{article_source_id_hash}'
                                    AND date BETWEEN '{str(date_from)}' AND '{str(date_to)}'
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
                                c > {count_thresh}
                                AND (
                                    article.is_duplicate = false
                                    OR article.id = '{article_id}'
                                )
                        """

                cursor2.execute(sql)
                candidates_rows = cursor2.fetchall()

                # Profiler ###############
                profiler.reg_time("t7")

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
                        logging.error(
                            ">> ERROR: Considered article not found. id:" + article_id
                        )
                    else:

                        logging.info(
                            f">> Duplicate candidates found for article ({article_id}): {str(len(candidates_rows)-1)}"
                        )

                        original = find_original(article, candidates)

                        if original is not None:
                            # Original found
                            logging.info(
                                f"   ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗"
                            )
                            logging.info(
                                f">> ║ Original found for article ({article_id}): {original.id}  ║"
                            )
                            logging.info(
                                f"   ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝"
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

                # Profiler ###############
                profiler.reg_time("t8")

                # Update article
                update_article(
                    cursor2,
                    cnxn2,
                    article_id,
                    is_duplicate_str,
                    original_article_id_str,
                )

                # Profiler ###############
                profiler.reg_time("t9")


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

    dc = DocComparator(SHINGLE_LENGTH, MAX_NUM_SHINGLES, DOC_COMPARATOR_OVERLAP_THRESH)

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
