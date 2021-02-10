-- Create the article uuid <--> int id map
INSERT INTO
    scraper.article_id_map(uuid)
SELECT
    id
FROM
    scraper.article
ORDER BY
    date;

--
--
--
-- Update article table =============================================================
-- Add int_id and original_article_int_id columns
ALTER TABLE
    scraper.article
ADD
    COLUMN int_id BIGINT,
ADD
    COLUMN original_article_int_id BIGINT;

-- Update article int_id and original_article_int_id
WITH data AS (
    SELECT
        a.id a_id,
        map1.id a_int_id,
        a.original_article_id a_original_article_id,
        map2.id a_original_article_int_id
    FROM
        scraper.article a
        INNER JOIN scraper.article_id_map map1 ON map1.uuid = a.id -- Left join, because some articles have the original_article_id set to null
        LEFT JOIN scraper.article_id_map map2 ON map2.uuid = a.original_article_id
)
UPDATE
    scraper.article
SET
    int_id = data.a_int_id,
    original_article_int_id = data.a_original_article_int_id
FROM
    data
WHERE
    scraper.article.id = data.a_id;

-- UPDATE 5031333
-- Query returned successfully in 1 hr 33 min.
--
-- Drop id column
ALTER TABLE
    scraper.article DROP COLUMN id,
    DROP COLUMN original_article_id;

-- Rename int_id and original_article_int_id columns
ALTER TABLE
    scraper.article RENAME COLUMN int_id TO id;

ALTER TABLE
    scraper.article RENAME COLUMN original_article_int_id TO original_article_id;

-- Set new id as primary key and set as autoincrement
ALTER TABLE
    scraper.article
ADD
    PRIMARY KEY (id);

CREATE SEQUENCE scraper.article_id_seq;

ALTER TABLE
    scraper.article
ALTER COLUMN
    id
SET
    DEFAULT nextval('scraper.article_id_seq');

ALTER SEQUENCE scraper.article_id_seq OWNED BY scraper.article.id;

SELECT
    setval('scraper.article_id_seq', COALESCE(max(id), 1))
FROM
    scraper.article;

--
--
--
-- Update article sketch table =========================================================
-- Add int_id and original_article_int_id columns
ALTER TABLE
    scraper.article_sketch
ADD
    COLUMN article_int_id BIGINT;

-- Update article_int_id (run in batches of 10.000.000)
WITH data AS (
    SELECT
        ask.id ask_id,
        map1.id ask_article_int_id
    FROM
        scraper.article_sketch ask
        INNER JOIN scraper.article_id_map map1 ON map1.uuid = ask.article_id
    WHERE
        ask.article_int_id IS NULL
    LIMIT
        10000000
)
UPDATE
    scraper.article_sketch
SET
    article_int_id = data.ask_article_int_id
FROM
    data
WHERE
    scraper.article_sketch.id = data.ask_id;

--Connection to the server has been lost.UPDATE 40130096
--Query returned successfully in 12 hr 13 min.
--
-- Drop article_id column
ALTER TABLE
    scraper.article_sketch DROP COLUMN article_id;

-- Rename article_int_id column
ALTER TABLE
    scraper.article_sketch RENAME COLUMN article_int_id TO article_id;

-- Delete any remaining row with null article_id so that
-- enabling the not null constraint does not throw errors
DELETE FROM
    scraper.article_sketch
WHERE
    article_id IS NULL;

--
--
--
-- Update article summary table =========================================================
-- Delete all rows (should be very few)
DELETE FROM
    scraper.article_summary;

-- Add int_id column
ALTER TABLE
    scraper.article_summary
ADD
    COLUMN int_id BIGINT;

-- Drop id column
ALTER TABLE
    scraper.article_summary DROP COLUMN id;

-- Rename int_id column
ALTER TABLE
    scraper.article_summary RENAME COLUMN int_id TO id;

-- Set new id as primary key and set as autoincrement
ALTER TABLE
    scraper.article_summary
ADD
    PRIMARY KEY (id);

CREATE SEQUENCE scraper.article_summary_id_seq;

ALTER TABLE
    scraper.article_summary
ALTER COLUMN
    id
SET
    DEFAULT nextval('scraper.article_summary_id_seq');

ALTER SEQUENCE scraper.article_summary_id_seq OWNED BY scraper.article_summary.id;

SELECT
    setval(
        'scraper.article_summary_id_seq',
        COALESCE(max(id), 1)
    )
FROM
    scraper.article_summary;