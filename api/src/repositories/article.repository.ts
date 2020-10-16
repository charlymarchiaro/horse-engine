import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { Article, ArticleRelations, ArticleSource, ArticleSpider } from '../models';
import { DbDataSource } from '../datasources';
import { inject, Getter } from '@loopback/core';
import { ArticleSourceRepository } from './article-source.repository';
import { ArticleWithRelations } from '../models/article.model';
import { ArticleSpiderRepository } from './article-spider.repository';

export class ArticleRepository extends DefaultCrudRepository<
  Article,
  typeof Article.prototype.id,
  ArticleRelations
  > {

  public readonly articleSource: BelongsToAccessor<ArticleSource, typeof Article.prototype.id>;
  
  public readonly articleSpider: BelongsToAccessor<ArticleSpider, typeof Article.prototype.id>;


  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ArticleSourceRepository') protected articleSourceRepositoryGetter: Getter<ArticleSourceRepository>, @repository.getter('ArticleSpiderRepository') protected articleSpiderRepositoryGetter: Getter<ArticleSpiderRepository>,
  ) {
    super(Article, dataSource);
    this.articleSource = this.createBelongsToAccessorFor('articleSource', articleSourceRepositoryGetter);
    this.registerInclusionResolver('articleSource', this.articleSource.inclusionResolver);
    this.articleSpider = this.createBelongsToAccessorFor('articleSpider', articleSpiderRepositoryGetter);
    this.registerInclusionResolver('articleSpider', this.articleSpider.inclusionResolver);
  }
}

// UPDATE scraper.article article SET
// 	scraped_at=details.scraped_at, 
// 	parse_function=details.parse_function, 
// 	result=details.result, 
// 	article_spider_id=details.article_spider_id
// FROM
// 	scraper.article_scraping_details details
// 	WHERE details.article_id = article.id