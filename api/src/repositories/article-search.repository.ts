import { DefaultTransactionalRepository } from '@loopback/repository';
import { ArticleBooleanQuery, ArticleSearchResultInfo, ArticleSearchResultInfoRelations } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { ArticleMatchCondition, ArticlePart, MatchCondition } from '../models/article-match-condition.model';
import { ArticleSecondaryMatchCondition, Condition } from '../models/article-secondary-match-condition.model';
import { getYYYYMMDD, getDateDiffDays, addDays } from '../utils';
import { ArticleSearchResponse } from '../controllers/article-search.controller';
import { SearchDateSpan } from '../models/search-date-span.model';

export class ArticleSearchRepository extends DefaultTransactionalRepository<
  ArticleSearchResultInfo,
  typeof ArticleSearchResultInfo.prototype.articleId,
  ArticleSearchResultInfoRelations
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleSearchResultInfo, dataSource);
  }


  async executeBooleanQuery(query: ArticleBooleanQuery): Promise<ArticleSearchResponse> {

    // Dates
    const fromDate = getYYYYMMDD(new Date(query.dateSpan.fromDateIncl));
    const toDate = getYYYYMMDD(new Date(query.dateSpan.toDateIncl));


    const conditions: string[] = [];

    // Secondary match conditions
    const areThereSecondaryMatchConditions =
      query.secondaryMatchConditions.length > 0;

    if (areThereSecondaryMatchConditions) {
      conditions.push(
        query.secondaryMatchConditions.map(
          condition => this.parseSecondaryMatchCondition(condition)
        ).join(' AND ')
      );
    }

    // Primary match conditions
    const areTherePrimaryMatchConditions =
      query.matchConditions.or.length > 0
      && query.matchConditions.or[0].and.length > 0

    const params: string[] = [];

    if (areTherePrimaryMatchConditions) {
      conditions.push(
        '(' + query.matchConditions.or.map(andGroup => {

          const andGroupSql = andGroup.and.map(
            matchCondition => {
              params.push(`%${matchCondition.textToMatch}%`);
              return this.parseMatchCondition(matchCondition);
            }
          ).join(' AND ');

          return `(${andGroupSql})`;
        }).join(' OR ') + ')'
      );
    }

    // Conditions SQL
    const areThereConditions = conditions.length > 0;

    const coditionsSql = areThereConditions
      ? ' AND ' + conditions.join(' AND ')
      : '';

    // SQL query
    const sql =
      `
      SELECT
          article.id AS article_id
      FROM
          scraper.article AS article
          INNER JOIN scraper.article_source AS source
            ON source.id = article.article_source_id
          INNER JOIN scraper.article_scraping_details AS details
            ON details.article_id = article.id
          INNER JOIN scraper.article_spider AS spider
            ON details.article_spider_id = spider.id
      WHERE
          article.date >= '${fromDate}'
          AND article.date <= '${toDate}'
          ${coditionsSql}

      ORDER BY
          article.last_updated
      `;

    console.log(sql)

    const result = await this.execute(sql, []) as { article_id: string }[];

    return {
      dateSpan: new SearchDateSpan({
        fromDateIncl: fromDate,
        toDateIncl: toDate,
      }),
      articleIds: result.map(i => i.article_id)
    };
  }


  parseMatchCondition(condition: ArticleMatchCondition): string {

    const partMap: { [part in ArticlePart]: string } = {
      url: 'article.url',
      title: 'article.title',
      text: 'article.text',
    };
    const part = partMap[condition.part];

    if (!part) {
      throw 'Invalid part: ' + condition.part;
    }

    if (condition.matchCondition in MatchCondition === false) {
      throw 'Invalid condition: ' + condition.matchCondition;
    }

    const operator = (
      condition.matchCondition === MatchCondition.contains

        // Contains
        ? condition.caseSensitive ? 'LIKE' : 'ILIKE'

        // Not contains
        : condition.caseSensitive ? 'NOT LIKE' : 'NOT ILIKE'
    );

    return `${part} ${operator} '%${condition.textToMatch}%'`;
  }


  parseSecondaryMatchCondition(condition: ArticleSecondaryMatchCondition): string {

    const field = condition.field;
    const param0 = condition.params[0]
    let parsedParamsArray = '';

    if (condition.params.length > 1) {
      parsedParamsArray = condition.params.map(
        p => `'${p}'`
      ).join(',')
    }

    switch (condition.condition) {
      case Condition.equals: return `${field} = '${param0}'`;
      case Condition.notEquals: return `${field} != '${param0}' `;
      case Condition.contains: return `${field} ILIKE '%${param0}%'`;
      case Condition.notContains: return `${field} NOT ILIKE '%${param0}%'`;
      case Condition.startsWith: return `${field} ILIKE '${param0}%'`;
      case Condition.notStartsWith: return `${field} NOT ILIKE '${param0}%'`;
      case Condition.endsWith: return `${field} ILIKE '%${param0}'`;
      case Condition.notEndsWith: return `${field} NOT ILIKE '%${param0}'`;
      case Condition.greaterThan: return `${field} > '${param0}'`;
      case Condition.greaterOrEqual: return `${field} >= '${param0}'`;
      case Condition.lessThan: return `${field} < '${param0}'`;
      case Condition.lessOrEqual: return `${field} <= '${param0}'`;
      case Condition.in: return `${field} IN (${parsedParamsArray})`;
      case Condition.notIn: return `${field} NOT IN (${parsedParamsArray})`;
      case Condition.isNull: return `${field} IS NULL`;
      case Condition.isNotNull: return `${field} IS NOT NULL`;

      default:
        throw 'Invalid condition: ' + condition.condition;
    }
  }
}
