import { DefaultTransactionalRepository, IsolationLevel } from '@loopback/repository';
import { ArticleScrapingStats, ArticleScrapingStatsRelations } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';
import moment = require('moment');


export class ArticleScrapingStatsRepository extends DefaultTransactionalRepository<
  ArticleScrapingStats,
  typeof ArticleScrapingStats.prototype.element,
  ArticleScrapingStatsRelations
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleScrapingStats, dataSource);
  }


  async getStatsPerSource(): Promise<ArticleScrapingStats[]> {

    const CURRENT_DATE_STR = moment().format('YYYY-MM-DD');
    const PSDD_H_PERIOD_DAYS_BACK = 60;

    const result = await this.execute(
      `
      WITH accum_date_ranges AS (
        SELECT
            source_name,
            MIN(accum.date) AS min_date,
            MAX(accum.date) AS max_date,
            MAX(accum.date) - MIN(accum.date) AS delta_dates
        FROM 
            scraper.article_scraping_stats_accum AS accum
        GROUP BY
            source_name
      ),
      accum_t0 AS (
        SELECT
            accum.*
        FROM 
            scraper.article_scraping_stats_accum AS accum
            INNER JOIN accum_date_ranges
              -- Consider latest date with valid data
              ON accum.date = accum_date_ranges.max_date
              AND accum.source_name = accum_date_ranges.source_name
      ),
      accum_t7 AS (
        SELECT
            accum.*
        FROM 
            scraper.article_scraping_stats_accum AS accum
            INNER JOIN accum_date_ranges
              -- Consider 7 days back or min_date if there is not enough data available
              ON accum.date = GREATEST($1::date - 7, accum_date_ranges.min_date)
              AND accum.source_name = accum_date_ranges.source_name
      ),
      dyn AS (
        SELECT
            source_name,
            date,
            CASE 
              WHEN published_count IS NOT NULL 
              THEN published_count 
              ELSE 0 
            END AS published_count,
            100.0 * pub_to_scrap_c1_count / scraped_count AS c1,
            100.0 * pub_to_scrap_c2_count / scraped_count AS c2,
            100.0 * pub_to_scrap_c3_count / scraped_count AS c3
        FROM
            scraper.article_scraping_stats_dyn AS dyn
      ),
      -- Parsing succ. rate - historical
      PSR_H AS (
        SELECT
            accum_t0.source_name,
            100.0 * accum_t0.total_success_count / 
            (
              accum_t0.total_success_count 
              + accum_t0.total_error_count
            ) AS val
        FROM 
            accum_t0
      ),
      -- Parsing succ. rate - 1 week
      PSR_1W AS (
        SELECT
            accum_t7.source_name,
            100.0 * (accum_t0.total_success_count - accum_t7.total_success_count) / 
            (
              accum_t0.total_success_count - accum_t7.total_success_count 
              + accum_t0.total_error_count - accum_t7.total_error_count
              + 0.000001 -- Offset to avoid division by zero error
            ) AS val
        FROM 
            accum_t0
            INNER JOIN accum_t7
              ON accum_t0.source_name = accum_t7.source_name
      ),
      -- Succ. scraped count per day - historical
      SSCD_H AS (
        SELECT
            dyn.source_name,
            AVG(dyn.published_count) AS val
        FROM 
            dyn
        GROUP BY
            source_name
      ),
      -- Succ. scraped count per day - 1 week
      SSCD_1W AS (
        SELECT
            dyn.source_name,
            AVG(dyn.published_count) AS val
        FROM 
            dyn
        WHERE
            dyn.date >= $1::date - 7
        GROUP BY
            source_name
      ),
      -- Published to scraped date diff histogram per day - historical
      PSDD_H AS (
        SELECT
            dyn.source_name,
            AVG(dyn.c1) AS c1,
            AVG(dyn.c2) AS c2,
            AVG(dyn.c3) AS c3
        FROM
            dyn
        WHERE
            dyn.date >= $1::date - ${PSDD_H_PERIOD_DAYS_BACK}
        GROUP BY
            dyn.source_name
      ),
      -- Published to scraped date diff histogram per day - 1 week
      PSDD_1W AS (
        SELECT
            dyn.source_name,
            AVG(dyn.c1) AS c1,
            AVG(dyn.c2) AS c2,
            AVG(dyn.c3) AS c3
        FROM
            dyn
        WHERE
            dyn.date >= $1::date - 7
        GROUP BY
            dyn.source_name
      )
      SELECT
          PSR_H.source_name AS source_name,
          PSR_H.val AS PSR_H,
          PSR_1W.val AS PSR_1W,
          SSCD_H.val AS SSCD_H,
          SSCD_1W.val AS SSCD_1W,
          PSDD_H.c1 AS PSDDC1_H,
          PSDD_H.c2 AS PSDDC2_H,
          PSDD_H.c3 AS PSDDC3_H,
          PSDD_1W.c1 AS PSDDC1_1W,
          PSDD_1W.c2 AS PSDDC2_1W,
          PSDD_1W.c3 AS PSDDC3_1W
      FROM
          PSR_H
          INNER JOIN PSR_1W
            ON PSR_H.source_name = PSR_1W.source_name
          INNER JOIN SSCD_H
            ON PSR_H.source_name = SSCD_H.source_name
          INNER JOIN SSCD_1W
            ON PSR_H.source_name = SSCD_1W.source_name
          INNER JOIN PSDD_H
            ON PSR_H.source_name = PSDD_H.source_name
          INNER JOIN PSDD_1W
            ON PSR_H.source_name = PSDD_1W.source_name
      `,
      [CURRENT_DATE_STR]
    );

    return result as ArticleScrapingStats[];
  }


  async getStatsTotal(): Promise<ArticleScrapingStats> {

    const CURRENT_DATE_STR = moment().format('YYYY-MM-DD');
    const PSDD_H_PERIOD_DAYS_BACK = 60;
    const SSCD_H_PERIOD_DAYS_BACK = 60;

    const result = await this.execute(
      `
      WITH accum_date_ranges AS (
        SELECT
            'TOTAL' AS source_name,
            MIN(accum.date) AS min_date,
            MAX(accum.date) AS max_date,
            MAX(accum.date) - MIN(accum.date) AS delta_dates
        FROM 
            scraper.article_scraping_stats_accum AS accum
      ),
      accum_t0 AS (
        SELECT
            'TOTAL' AS source_name,
            SUM(accum.total_success_count) AS total_success_count,
            SUM(accum.total_error_count) AS total_error_count
        FROM 
            scraper.article_scraping_stats_accum AS accum
            INNER JOIN accum_date_ranges
              -- Consider latest date with valid data
              ON accum.date = accum_date_ranges.max_date
      ),
      accum_t7 AS (
        SELECT
            'TOTAL' AS source_name,
            SUM(accum.total_success_count) AS total_success_count,
            SUM(accum.total_error_count) AS total_error_count
        FROM 
            scraper.article_scraping_stats_accum AS accum
            INNER JOIN accum_date_ranges
              -- Consider 7 days back or min_date if there is not enough data available
              ON accum.date = GREATEST($1::date - 7, accum_date_ranges.min_date)
      ),
      dyn AS (
        SELECT
            'TOTAL' AS source_name,
            date,
            SUM(
              CASE 
                WHEN published_count IS NOT NULL 
                THEN published_count 
                ELSE 0 
              END
            ) AS published_count,	
            100.0 * SUM(pub_to_scrap_c1_count) / SUM(scraped_count) AS c1,
            100.0 * SUM(pub_to_scrap_c2_count) / SUM(scraped_count) AS c2,
            100.0 * SUM(pub_to_scrap_c3_count) / SUM(scraped_count) AS c3			
        FROM
            scraper.article_scraping_stats_dyn AS dyn
        GROUP BY
            date
      ),
      -- Parsing succ. rate - historical
      PSR_H AS (
        SELECT
            'TOTAL' AS source_name,
            100.0 * accum_t0.total_success_count / 
            (
              accum_t0.total_success_count 
              + accum_t0.total_error_count
            ) AS val
        FROM 
            accum_t0
      ),
      -- Parsing succ. rate - 1 week
      PSR_1W AS (
        SELECT
            'TOTAL' AS source_name,
            100.0 * (accum_t0.total_success_count - accum_t7.total_success_count) / 
            (
              accum_t0.total_success_count - accum_t7.total_success_count 
              + accum_t0.total_error_count - accum_t7.total_error_count
              + 0.000001 -- Offset to avoid division by zero error
            ) AS val
        FROM 
            accum_t0
            INNER JOIN accum_t7
              ON accum_t0.source_name = accum_t7.source_name
      ),
      -- Succ. scraped count per day - historical
      SSCD_H AS (
        SELECT
            'TOTAL' AS source_name,
            AVG(dyn.published_count) AS val
        FROM 
            dyn
        WHERE
            dyn.date >= $1::date - ${SSCD_H_PERIOD_DAYS_BACK}
            AND dyn.date <= $1::date
      ),
      -- Succ. scraped count per day - 1 week
      SSCD_1W AS (
        SELECT
            'TOTAL' AS source_name,
            AVG(dyn.published_count) AS val
        FROM 
            dyn
        WHERE
            dyn.date >= $1::date - 7
            AND dyn.date <= $1::date
      ),
      -- Published to scraped date diff histogram per day - historical
      PSDD_H AS (
        SELECT
            'TOTAL' AS source_name,
            AVG(dyn.c1) AS c1,
            AVG(dyn.c2) AS c2,
            AVG(dyn.c3) AS c3
        FROM
            dyn
        WHERE
            dyn.date >= $1::date - ${PSDD_H_PERIOD_DAYS_BACK}
            AND dyn.date <= $1::date
      ),
      -- Published to scraped date diff histogram per day - 1 week
      PSDD_1W AS (
        SELECT
            'TOTAL' AS source_name,
            AVG(dyn.c1) AS c1,
            AVG(dyn.c2) AS c2,
            AVG(dyn.c3) AS c3
        FROM
            dyn
        WHERE
            dyn.date >= $1::date - 7
            AND dyn.date <= $1::date
      )
      SELECT
           'TOTAL' AS source_name,
           PSR_H.val AS PSR_H,
           PSR_1W.val AS PSR_1W,
          SSCD_H.val AS SSCD_H,
          SSCD_1W.val AS SSCD_1W,
          PSDD_H.c1 AS PSDDC1_H,
          PSDD_H.c2 AS PSDDC2_H,
          PSDD_H.c3 AS PSDDC3_H,
          PSDD_1W.c1 AS PSDDC1_1W,
          PSDD_1W.c2 AS PSDDC2_1W,
          PSDD_1W.c3 AS PSDDC3_1W
      FROM
           PSR_H
           INNER JOIN PSR_1W
             ON PSR_H.source_name = PSR_1W.source_name
           INNER JOIN SSCD_H
             ON PSR_H.source_name = SSCD_H.source_name
          INNER JOIN SSCD_1W
             ON PSR_H.source_name = SSCD_1W.source_name
          INNER JOIN PSDD_H
             ON PSR_H.source_name = PSDD_H.source_name
          INNER JOIN PSDD_1W
             ON PSR_H.source_name = PSDD_1W.source_name
      `,
      [CURRENT_DATE_STR]
    );

    return result[0] as ArticleScrapingStats;
  }

}
