import {DefaultCrudRepository} from '@loopback/repository';
import {ArticleIdMap, ArticleIdMapRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ArticleIdMapRepository extends DefaultCrudRepository<
  ArticleIdMap,
  typeof ArticleIdMap.prototype.id,
  ArticleIdMapRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleIdMap, dataSource);
  }
}
