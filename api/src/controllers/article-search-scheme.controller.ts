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
import { ArticleSearchScheme } from '../models';
import { ArticleSearchSchemeRepository } from '../repositories';


@authenticate('jwt')
export class ArticleSearchSchemeController {
  constructor(
    @repository(ArticleSearchSchemeRepository)
    public articleSearchSchemeRepository: ArticleSearchSchemeRepository,
  ) { }

  @post('/article-search-schemes', {
    responses: {
      '200': {
        description: 'ArticleSearchScheme model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ArticleSearchScheme) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSearchScheme, {
            title: 'NewArticleSearchScheme',
            exclude: ['id'],
          }),
        },
      },
    })
    articleSearchScheme: Omit<ArticleSearchScheme, 'id'>,
  ): Promise<ArticleSearchScheme> {
    return this.articleSearchSchemeRepository.create(articleSearchScheme);
  }

  @get('/article-search-schemes/count', {
    responses: {
      '200': {
        description: 'ArticleSearchScheme model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(ArticleSearchScheme) where?: Where<ArticleSearchScheme>,
  ): Promise<Count> {
    return this.articleSearchSchemeRepository.count(where);
  }

  @get('/article-search-schemes', {
    responses: {
      '200': {
        description: 'Array of ArticleSearchScheme model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ArticleSearchScheme, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ArticleSearchScheme) filter?: Filter<ArticleSearchScheme>,
  ): Promise<ArticleSearchScheme[]> {
    return this.articleSearchSchemeRepository.find(filter);
  }

  @patch('/article-search-schemes', {
    responses: {
      '200': {
        description: 'ArticleSearchScheme PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSearchScheme, { partial: true }),
        },
      },
    })
    articleSearchScheme: ArticleSearchScheme,
    @param.where(ArticleSearchScheme) where?: Where<ArticleSearchScheme>,
  ): Promise<Count> {
    return this.articleSearchSchemeRepository.updateAll(articleSearchScheme, where);
  }

  @get('/article-search-schemes/{id}', {
    responses: {
      '200': {
        description: 'ArticleSearchScheme model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ArticleSearchScheme, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ArticleSearchScheme, { exclude: 'where' }) filter?: FilterExcludingWhere<ArticleSearchScheme>
  ): Promise<ArticleSearchScheme> {
    return this.articleSearchSchemeRepository.findById(id, filter);
  }

  @patch('/article-search-schemes/{id}', {
    responses: {
      '204': {
        description: 'ArticleSearchScheme PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSearchScheme, { partial: true }),
        },
      },
    })
    articleSearchScheme: ArticleSearchScheme,
  ): Promise<void> {
    await this.articleSearchSchemeRepository.updateById(id, articleSearchScheme);
  }

  @put('/article-search-schemes/{id}', {
    responses: {
      '204': {
        description: 'ArticleSearchScheme PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() articleSearchScheme: ArticleSearchScheme,
  ): Promise<void> {
    await this.articleSearchSchemeRepository.replaceById(id, articleSearchScheme);
  }

  @del('/article-search-schemes/{id}', {
    responses: {
      '204': {
        description: 'ArticleSearchScheme DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.articleSearchSchemeRepository.deleteById(id);
  }
}
