import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {ArticleSpider, ArticleSpiderRelations, ArticleSource} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ArticleSourceRepository} from './article-source.repository';

export class ArticleSpiderRepository extends DefaultCrudRepository<
  ArticleSpider,
  typeof ArticleSpider.prototype.id,
  ArticleSpiderRelations
> {

  public readonly articleSource: BelongsToAccessor<ArticleSource, typeof ArticleSpider.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSourceRepository') protected articleSourceRepositoryGetter: Getter<ArticleSourceRepository>,
  ) {
    super(ArticleSpider, dataSource);
    this.articleSource = this.createBelongsToAccessorFor('articleSource', articleSourceRepositoryGetter,);
    this.registerInclusionResolver('articleSource', this.articleSource.inclusionResolver);
  }
}
