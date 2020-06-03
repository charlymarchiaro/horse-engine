import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {ArticleSpider, ArticleSpiderRelations, ArticleSource, ArticleScrapingDetails} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ArticleSourceRepository} from './article-source.repository';
import {ArticleScrapingDetailsRepository} from './article-scraping-details.repository';

export class ArticleSpiderRepository extends DefaultCrudRepository<
  ArticleSpider,
  typeof ArticleSpider.prototype.id,
  ArticleSpiderRelations
> {

  public readonly articleSource: BelongsToAccessor<ArticleSource, typeof ArticleSpider.prototype.id>;

  public readonly articleScrapingDetails: HasManyRepositoryFactory<ArticleScrapingDetails, typeof ArticleSpider.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSourceRepository') protected articleSourceRepositoryGetter: Getter<ArticleSourceRepository>, @repository.getter('ArticleScrapingDetailsRepository') protected articleScrapingDetailsRepositoryGetter: Getter<ArticleScrapingDetailsRepository>,
  ) {
    super(ArticleSpider, dataSource);
    this.articleScrapingDetails = this.createHasManyRepositoryFactoryFor('articleScrapingDetails', articleScrapingDetailsRepositoryGetter,);
    this.articleSource = this.createBelongsToAccessorFor('articleSource', articleSourceRepositoryGetter,);
    this.registerInclusionResolver('articleSource', this.articleSource.inclusionResolver);
  }
}
