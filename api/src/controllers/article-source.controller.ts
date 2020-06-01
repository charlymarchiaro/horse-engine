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
import {ArticleSource} from '../models';
import {ArticleSourceRepository} from '../repositories';

export class ArticleSourceController {
  constructor(
    @repository(ArticleSourceRepository)
    public articleSourceRepository : ArticleSourceRepository,
  ) {}

  @post('/article-sources', {
    responses: {
      '200': {
        description: 'ArticleSource model instance',
        content: {'application/json': {schema: getModelSchemaRef(ArticleSource)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSource, {
            title: 'NewArticleSource',
            exclude: ['id'],
          }),
        },
      },
    })
    articleSource: Omit<ArticleSource, 'id'>,
  ): Promise<ArticleSource> {
    return this.articleSourceRepository.create(articleSource);
  }

  @get('/article-sources/count', {
    responses: {
      '200': {
        description: 'ArticleSource model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ArticleSource) where?: Where<ArticleSource>,
  ): Promise<Count> {
    return this.articleSourceRepository.count(where);
  }

  @get('/article-sources', {
    responses: {
      '200': {
        description: 'Array of ArticleSource model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ArticleSource, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ArticleSource) filter?: Filter<ArticleSource>,
  ): Promise<ArticleSource[]> {
    return this.articleSourceRepository.find(filter);
  }

  @patch('/article-sources', {
    responses: {
      '200': {
        description: 'ArticleSource PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSource, {partial: true}),
        },
      },
    })
    articleSource: ArticleSource,
    @param.where(ArticleSource) where?: Where<ArticleSource>,
  ): Promise<Count> {
    return this.articleSourceRepository.updateAll(articleSource, where);
  }

  @get('/article-sources/{id}', {
    responses: {
      '200': {
        description: 'ArticleSource model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ArticleSource, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ArticleSource, {exclude: 'where'}) filter?: FilterExcludingWhere<ArticleSource>
  ): Promise<ArticleSource> {
    return this.articleSourceRepository.findById(id, filter);
  }

  @patch('/article-sources/{id}', {
    responses: {
      '204': {
        description: 'ArticleSource PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSource, {partial: true}),
        },
      },
    })
    articleSource: ArticleSource,
  ): Promise<void> {
    await this.articleSourceRepository.updateById(id, articleSource);
  }

  @put('/article-sources/{id}', {
    responses: {
      '204': {
        description: 'ArticleSource PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() articleSource: ArticleSource,
  ): Promise<void> {
    await this.articleSourceRepository.replaceById(id, articleSource);
  }

  @del('/article-sources/{id}', {
    responses: {
      '204': {
        description: 'ArticleSource DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.articleSourceRepository.deleteById(id);
  }
}
