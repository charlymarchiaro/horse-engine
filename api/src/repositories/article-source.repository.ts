import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {ArticleSource, ArticleSourceRelations, Article, ArticleSpider} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {ArticleRepository} from './article.repository';
import {ArticleSpiderRepository} from './article-spider.repository';

export class ArticleSourceRepository extends DefaultCrudRepository<
  ArticleSource,
  typeof ArticleSource.prototype.id,
  ArticleSourceRelations
> {

  public readonly articles: HasManyRepositoryFactory<Article, typeof ArticleSource.prototype.id>;

  public readonly spiders: HasManyRepositoryFactory<ArticleSpider, typeof ArticleSource.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleRepository') protected articleRepositoryGetter: Getter<ArticleRepository>, @repository.getter('ArticleSpiderRepository') protected articleSpiderRepositoryGetter: Getter<ArticleSpiderRepository>,
  ) {
    super(ArticleSource, dataSource);
    this.spiders = this.createHasManyRepositoryFactoryFor('spiders', articleSpiderRepositoryGetter,);
    this.registerInclusionResolver('spiders', this.spiders.inclusionResolver);
    this.articles = this.createHasManyRepositoryFactoryFor('articles', articleRepositoryGetter,);
    this.registerInclusionResolver('articles', this.articles.inclusionResolver);
  }
}
