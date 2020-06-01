import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  ArticleScrapingDetails,
  Article,
} from '../models';
import {ArticleScrapingDetailsRepository} from '../repositories';

export class ArticleScrapingDetailsArticleController {
  constructor(
    @repository(ArticleScrapingDetailsRepository)
    public articleScrapingDetailsRepository: ArticleScrapingDetailsRepository,
  ) { }

  @get('/article-scraping-details/{id}/article', {
    responses: {
      '200': {
        description: 'Article belonging to ArticleScrapingDetails',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Article)},
          },
        },
      },
    },
  })
  async getArticle(
    @param.path.number('id') id: typeof ArticleScrapingDetails.prototype.id,
  ): Promise<Article> {
    return this.articleScrapingDetailsRepository.article(id);
  }
}
