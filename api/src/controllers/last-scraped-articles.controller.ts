import { authenticate } from '@loopback/authentication';

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { ArticleSummary } from '../models';
import { ArticleSummaryRepository } from '../repositories';
import { authorize } from '@loopback/authorization';
import { Role } from '../models/role.model';
import { basicAuthorization } from '../services';


@authenticate('jwt')
@authorize({ allowedRoles: [Role.ROLE_USER], voters: [basicAuthorization] })
export class LastScrapedArticlesController {
  constructor(
    @repository(ArticleSummaryRepository)
    public articleSummaryRepository: ArticleSummaryRepository,
  ) { }

  @get('/last-scraped-articles', {
    responses: {
      '200': {
        description: 'Array of ArticleSummary model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ArticleSummary, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ArticleSummary) filter?: Filter<ArticleSummary>,
  ): Promise<ArticleSummary[]> {
    return this.articleSummaryRepository.find(filter);
  }
}
