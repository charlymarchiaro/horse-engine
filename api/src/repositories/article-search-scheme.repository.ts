import {DefaultCrudRepository} from '@loopback/repository';
import {ArticleSearchScheme, ArticleSearchSchemeRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';
import { TimeStampCrudRepository } from '../extensions/time-stamp-crud.repository.base';

export class ArticleSearchSchemeRepository extends TimeStampCrudRepository<
  ArticleSearchScheme,
  typeof ArticleSearchScheme.prototype.id
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleSearchScheme, dataSource);
  }
}
