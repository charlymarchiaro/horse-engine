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
import {Article} from '../models';
import {ArticleRepository} from '../repositories';

export class ArticleController {
  constructor(
    @repository(ArticleRepository)
    public articleRepository : ArticleRepository,
  ) {}

  @post('/articles', {
    responses: {
      '200': {
        description: 'Article model instance',
        content: {'application/json': {schema: getModelSchemaRef(Article)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {
            title: 'NewArticle',
            exclude: ['id'],
          }),
        },
      },
    })
    article: Omit<Article, 'id'>,
  ): Promise<Article> {
    return this.articleRepository.create(article);
  }

  @get('/articles/count', {
    responses: {
      '200': {
        description: 'Article model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Article) where?: Where<Article>,
  ): Promise<Count> {
    return this.articleRepository.count(where);
  }

  @get('/articles', {
    responses: {
      '200': {
        description: 'Array of Article model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Article, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Article) filter?: Filter<Article>,
  ): Promise<Article[]> {
    return this.articleRepository.find(filter);
  }

  @patch('/articles', {
    responses: {
      '200': {
        description: 'Article PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {partial: true}),
        },
      },
    })
    article: Article,
    @param.where(Article) where?: Where<Article>,
  ): Promise<Count> {
    return this.articleRepository.updateAll(article, where);
  }

  @get('/articles/{id}', {
    responses: {
      '200': {
        description: 'Article model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Article, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Article, {exclude: 'where'}) filter?: FilterExcludingWhere<Article>
  ): Promise<Article> {
    return this.articleRepository.findById(id, filter);
  }

  @patch('/articles/{id}', {
    responses: {
      '204': {
        description: 'Article PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {partial: true}),
        },
      },
    })
    article: Article,
  ): Promise<void> {
    await this.articleRepository.updateById(id, article);
  }

  @put('/articles/{id}', {
    responses: {
      '204': {
        description: 'Article PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() article: Article,
  ): Promise<void> {
    await this.articleRepository.replaceById(id, article);
  }

  @del('/articles/{id}', {
    responses: {
      '204': {
        description: 'Article DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.articleRepository.deleteById(id);
  }
}
