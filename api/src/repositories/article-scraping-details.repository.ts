import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {ArticleScrapingDetails, ArticleScrapingDetailsRelations, ArticleSpider, Article} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ArticleSpiderRepository} from './article-spider.repository';
import {ArticleRepository} from './article.repository';

export class ArticleScrapingDetailsRepository extends DefaultCrudRepository<
  ArticleScrapingDetails,
  typeof ArticleScrapingDetails.prototype.id,
  ArticleScrapingDetailsRelations
> {

  public readonly spider: BelongsToAccessor<ArticleSpider, typeof ArticleScrapingDetails.prototype.id>;

  public readonly article: BelongsToAccessor<Article, typeof ArticleScrapingDetails.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSpiderRepository') protected articleSpiderRepositoryGetter: Getter<ArticleSpiderRepository>, @repository.getter('ArticleRepository') protected articleRepositoryGetter: Getter<ArticleRepository>,
  ) {
    super(ArticleScrapingDetails, dataSource);
    this.article = this.createBelongsToAccessorFor('article', articleRepositoryGetter,);
    this.registerInclusionResolver('article', this.article.inclusionResolver);
    this.spider = this.createBelongsToAccessorFor('spider', articleSpiderRepositoryGetter,);
    this.registerInclusionResolver('spider', this.spider.inclusionResolver);
  }
}
