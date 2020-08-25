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

    const currentDateStr = moment().format('YYYY-MM-DD');

    // Begin transaction
    const tx = await this.beginTransaction(IsolationLevel.READ_COMMITTED);

    try {

      // Delete any existing data for current date
      const deletedCount = await this.deleteAll(
        { date: { eq: currentDateStr } },
        { transaction: tx },
      );

      // Update current date values
      const result = await this.execute(
        `
        WITH data_1 AS (
          SELECT        
              source.name AS source_name, 
              CASE WHEN details.result = 'success' THEN 1 ELSE 0 END AS success,
              CASE WHEN details.result = 'error' THEN 1 ELSE 0 END AS error,
              article.url AS url
          FROM
              scraper.article_scraping_details AS details
              INNER JOIN scraper.article AS article
                ON article.id = details.article_id
              INNER JOIN scraper.article_source AS source
                ON source.id = article.article_source_id
        ),
        data_2 AS (
          SELECT
              source_name,
              SUM(success) AS success,
              SUM(error) AS error,
              COUNT(url) AS total
          FROM
              data_1
          GROUP BY
              source_name
        )
        INSERT INTO
            scraper.article_scraping_stats_accum(
              date,
              source_name,
              total_error_count,
              total_success_count
            )
        SELECT
            $1,
            source_name,
            error,
            success
        FROM
            data_2
        ORDER BY
            source_name
        `,
        [currentDateStr],
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
