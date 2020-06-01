import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {ArticleSpider, ArticleSpiderRelations, ArticleSource} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ArticleSourceRepository} from './article-source.repository';

export class ArticleSpiderRepository extends DefaultCrudRepository<
  ArticleSpider,
  typeof ArticleSpider.prototype.id,
  ArticleSpiderRelations
> {

  public readonly source: BelongsToAccessor<ArticleSource, typeof ArticleSpider.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSourceRepository') protected articleSourceRepositoryGetter: Getter<ArticleSourceRepository>,
  ) {
    super(ArticleSpider, dataSource);
    this.source = this.createBelongsToAccessorFor('source', articleSourceRepositoryGetter,);
    this.registerInclusionResolver('source', this.source.inclusionResolver);
  }
}
