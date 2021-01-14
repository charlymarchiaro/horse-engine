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
  ArticleSpider,
  ArticleSource,
} from '../models';
import { ArticleSpiderRepository } from '../repositories';
import { authorize } from '@loopback/authorization';
import { Role } from '../models/role.model';
import { basicAuthorization } from '../services';


@authenticate('jwt')
@authorize({ allowedRoles: [Role.ROLE_USER], voters: [basicAuthorization] })
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
            schema: { type: 'array', items: getModelSchemaRef(ArticleSource) },
          },
        },
      },
    },
  })
  async getArticleSource(
    @param.path.string('id') id: typeof ArticleSpider.prototype.id,
  ): Promise<ArticleSource> {
    return this.articleSpiderRepository.articleSource(id);
  }
}
