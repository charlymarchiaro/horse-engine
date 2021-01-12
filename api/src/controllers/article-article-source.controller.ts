import { authenticate } from '@loopback/authentication';

import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Article,
  ArticleSource,
} from '../models';
import { ArticleRepository } from '../repositories';


@authenticate('jwt')
export class ArticleArticleSourceController {
  constructor(
    @repository(ArticleRepository)
    public articleRepository: ArticleRepository,
  ) { }

  @get('/articles/{id}/article-source', {
    responses: {
      '200': {
        description: 'ArticleSource belonging to Article',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(ArticleSource) },
          },
        },
      },
    },
  })
  async getArticleSource(
    @param.path.string('id') id: typeof Article.prototype.id,
  ): Promise<ArticleSource> {
    return this.articleRepository.articleSource(id);
  }
}
