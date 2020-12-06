import {DefaultCrudRepository} from '@loopback/repository';
import {ArticleSketch, ArticleSketchRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ArticleSketchRepository extends DefaultCrudRepository<
  ArticleSketch,
  typeof ArticleSketch.prototype.id,
  ArticleSketchRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ArticleSketch, dataSource);
  }
}
