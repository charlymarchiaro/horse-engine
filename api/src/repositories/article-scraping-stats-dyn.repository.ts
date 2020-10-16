import { DefaultTransactionalRepository, IsolationLevel } from '@loopback/repository';
import { ArticleScrapingStatsDyn, ArticleScrapingStatsDynRelations } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { HttpErrors } from '@loopback/rest';
import moment = require('moment');


export class ArticleScrapingStatsDynRepository extends DefaultTransactionalRepository<
  ArticleScrapingStatsDyn,
  typeof ArticleScrapingStatsDyn.prototype.id,
  ArticleScrapingStatsDynRelations
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleScrapingStatsDyn, dataSource);
  }

  async updateValues() {

    // Begin transaction
    const tx = await this.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {

      const CURRENT_DATE_STR = moment().format('YYYY-MM-DD');
      const PERIOD_DAYS_BACK = 60;


      // Clear current data
      const deletedCount = await this.execute(
        `
        TRUNCATE TABLE scraper.article_scraping_stats_dyn
        `,
        [],
        { transaction: tx },
      );

      // Insert new data
      const result = await this.execute(
        `
        WITH article AS (
          SELECT 
              id,
              date,
              scraped_at,
              article_source_id
          FROM
              scraper.article
          WHERE
              date >= $1::date - ${PERIOD_DAYS_BACK}
        ),
        data_published_1 AS (
          SELECT        
              source.id AS source_id, 
              article.date AS date1,
              COUNT(article.id) AS published_count
          FROM           
              article
              INNER JOIN scraper.article_source AS source
                ON source.id = article.article_source_id
          WHERE
              article.date IS NOT NULL
              AND article.date >= $1::date - ${PERIOD_DAYS_BACK}
          GROUP BY
              source_id, date1
        ),
        data_scraped_1 AS (
          SELECT        
              source.id AS source_id, 
              article.scraped_at::date AS date1,
              COUNT(article.id) AS scraped_count
          FROM           
              article
              INNER JOIN scraper.article_source AS source
                ON source.id = article.article_source_id
          WHERE
              article.date >= $1::date - ${PERIOD_DAYS_BACK}
          GROUP BY
              source_id, date1
        ),
        data_pub_to_scrap_1 AS (
          SELECT
              source.id AS source_id,
              article.scraped_at::date AS scrap_date,
              article.date AS pub_date,
              article.scraped_at::date - article.date AS delta
          FROM
              article
              INNER JOIN scraper.article_source AS source
                ON source.id = article.article_source_id
          WHERE
              article.date IS NOT NULL
              AND article.date >= $1::date - ${PERIOD_DAYS_BACK}
        ),
        data_pub_to_scrap_2 AS (
          SELECT
              source_id,
              scrap_date AS date1,
              CASE WHEN delta < 2 THEN 1 ELSE 0 END AS c1,
              CASE WHEN delta >= 2 AND delta < 4 THEN 1 ELSE 0 END AS c2,
              CASE WHEN delta >= 4 THEN 1 ELSE 0 END AS c3
          FROM
              data_pub_to_scrap_1
        ),
        data_pub_to_scrap_3 AS (
          SELECT
              source_id,
              date1,
              SUM(c1) AS c1,
              SUM(c2) AS c2,
              SUM(c3) AS c3
          FROM
              data_pub_to_scrap_2
          GROUP BY
              source_id, date1
        )
        INSERT INTO
            scraper.article_scraping_stats_dyn(
              date, 
              source_id, 
              published_count, 
              scraped_count,
              pub_to_scrap_c1_count,
              pub_to_scrap_c2_count,
              pub_to_scrap_c3_count
            )
        SELECT
            CASE WHEN data_published_1.date1 IS NOT NULL THEN data_published_1.date1
              ELSE CASE WHEN data_scraped_1.date1 IS NOT NULL THEN data_scraped_1.date1	END
            END AS date1,
            CASE WHEN data_published_1.source_id IS NOT NULL THEN data_published_1.source_id
              ELSE CASE WHEN data_scraped_1.source_id IS NOT NULL THEN data_scraped_1.source_id END
            END AS source_id,
            data_published_1.published_count,
            data_scraped_1.scraped_count,
            data_pub_to_scrap_3.c1,
            data_pub_to_scrap_3.c2,
            data_pub_to_scrap_3.c3
        FROM
            data_published_1
            FULL JOIN data_scraped_1
              ON data_published_1.date1 = data_scraped_1.date1
              AND data_published_1.source_id = data_scraped_1.source_id
            FULL JOIN data_pub_to_scrap_3
              ON data_scraped_1.date1 = data_pub_to_scrap_3.date1
              AND data_scraped_1.source_id = data_pub_to_scrap_3.source_id
        ORDER BY 
            source_id, date1
        `,
        [CURRENT_DATE_STR],
        { transaction: tx },
      );

      // Commit transaction
      await tx.commit();

    } catch (e) {

      tx.rollback();
      console.error(e.message);
      throw e;
    }
  }
}
