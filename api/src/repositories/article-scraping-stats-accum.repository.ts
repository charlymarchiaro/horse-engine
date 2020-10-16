import { DefaultTransactionalRepository, IsolationLevel } from '@loopback/repository';
import { ArticleScrapingStatsAccum, ArticleScrapingStatsAccumRelations } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';
import moment = require('moment');

export class ArticleScrapingStatsAccumRepository extends DefaultTransactionalRepository<
  ArticleScrapingStatsAccum,
  typeof ArticleScrapingStatsAccum.prototype.id,
  ArticleScrapingStatsAccumRelations
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleScrapingStatsAccum, dataSource);
  }


  async updateCurrentDateValues() {

    const CURRENT_DATE_STR = moment().format('YYYY-MM-DD');

    // Begin transaction
    const tx = await this.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {

      // Delete any existing data for current date
      const deletedCount = await this.deleteAll(
        { date: { eq: CURRENT_DATE_STR } },
        { transaction: tx },
      );

      // Update current date values
      const result = await this.execute(
        `
        WITH data_1 AS (
          SELECT        
              source.id AS source_id, 
              CASE WHEN article.result = 'success' THEN 1 ELSE 0 END AS success,
              CASE WHEN article.result = 'error' THEN 1 ELSE 0 END AS error,
              article.url AS url
          FROM
              scraper.article AS article
              INNER JOIN scraper.article_source AS source
                ON source.id = article.article_source_id
        ),
        data_2 AS (
          SELECT
              source_id,
              SUM(success) AS success,
              SUM(error) AS error,
              COUNT(url) AS total
          FROM
              data_1
          GROUP BY
              source_id
        )
        INSERT INTO
            scraper.article_scraping_stats_accum(
              date,
              source_id,
              total_error_count,
              total_success_count
            )
        SELECT
            $1,
            source_id,
            error,
            success
        FROM
            data_2
        ORDER BY
            source_id
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
