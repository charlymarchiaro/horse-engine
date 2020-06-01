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
  ArticleSpider,
} from '../models';
import {ArticleScrapingDetailsRepository} from '../repositories';

export class ArticleScrapingDetailsArticleSpiderController {
  constructor(
    @repository(ArticleScrapingDetailsRepository)
    public articleScrapingDetailsRepository: ArticleScrapingDetailsRepository,
  ) { }

  @get('/article-scraping-details/{id}/article-spider', {
    responses: {
      '200': {
        description: 'ArticleSpider belonging to ArticleScrapingDetails',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ArticleSpider)},
          },
        },
      },
    },
  })
  async getArticleSpider(
    @param.path.string('id') id: typeof ArticleScrapingDetails.prototype.id,
  ): Promise<ArticleSpider> {
    return this.articleScrapingDetailsRepository.articleSpider(id);
  }
}
