import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  ArticleSpider,
  ArticleSource,
} from '../models';
import {ArticleSpiderRepository} from '../repositories';

export class ArticleSpiderArticleSourceController {
  constructor(
    @repository(ArticleSpiderRepository)
    public articleSpiderRepository: ArticleSpiderRepository,
  ) { }

  @get('/article-spiders/{id}/article-source', {
    responses: {
      '200': {
        description: 'ArticleSource belonging to ArticleSpider',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ArticleSource)},
          },
        },
      },
    },
  })
  async getArticleSource(
    @param.path.number('id') id: typeof ArticleSpider.prototype.id,
  ): Promise<ArticleSource> {
    return this.articleSpiderRepository.source(id);
  }
}
