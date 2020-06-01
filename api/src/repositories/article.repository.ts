import {DefaultCrudRepository, repository, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {Article, ArticleRelations, ArticleSource, ArticleScrapingDetails} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ArticleSourceRepository} from './article-source.repository';
import {ArticleScrapingDetailsRepository} from './article-scraping-details.repository';

export class ArticleRepository extends DefaultCrudRepository<
  Article,
  typeof Article.prototype.id,
  ArticleRelations
> {

  public readonly articleSource: BelongsToAccessor<ArticleSource, typeof Article.prototype.id>;

  public readonly articleScrapingDetails: HasOneRepositoryFactory<ArticleScrapingDetails, typeof Article.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSourceRepository') protected articleSourceRepositoryGetter: Getter<ArticleSourceRepository>, @repository.getter('ArticleScrapingDetailsRepository') protected articleScrapingDetailsRepositoryGetter: Getter<ArticleScrapingDetailsRepository>,
  ) {
    super(Article, dataSource);
    this.articleScrapingDetails = this.createHasOneRepositoryFactoryFor('articleScrapingDetails', articleScrapingDetailsRepositoryGetter);
    this.registerInclusionResolver('articleScrapingDetails', this.articleScrapingDetails.inclusionResolver);
    this.articleSource = this.createBelongsToAccessorFor('articleSource', articleSourceRepositoryGetter,);
    this.registerInclusionResolver('articleSource', this.articleSource.inclusionResolver);
  }
}
