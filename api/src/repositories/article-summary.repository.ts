import {DefaultCrudRepository} from '@loopback/repository';
import {ArticleSummary, ArticleSummaryRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ArticleSummaryRepository extends DefaultCrudRepository<
  ArticleSummary,
  typeof ArticleSummary.prototype.id,
  ArticleSummaryRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleSummary, dataSource);
  }
}
