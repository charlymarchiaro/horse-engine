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

  public readonly source: BelongsToAccessor<ArticleSource, typeof Article.prototype.id>;

  public readonly scrapingDetails: HasOneRepositoryFactory<ArticleScrapingDetails, typeof Article.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSourceRepository') protected articleSourceRepositoryGetter: Getter<ArticleSourceRepository>, @repository.getter('ArticleScrapingDetailsRepository') protected articleScrapingDetailsRepositoryGetter: Getter<ArticleScrapingDetailsRepository>,
  ) {
    super(Article, dataSource);
    this.scrapingDetails = this.createHasOneRepositoryFactoryFor('scrapingDetails', articleScrapingDetailsRepositoryGetter);
    this.registerInclusionResolver('scrapingDetails', this.scrapingDetails.inclusionResolver);
    this.source = this.createBelongsToAccessorFor('source', articleSourceRepositoryGetter,);
    this.registerInclusionResolver('source', this.source.inclusionResolver);
  }
}
