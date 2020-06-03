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
import {ArticleSpider} from '../models';
import {ArticleSpiderRepository} from '../repositories';

export class ArticleSpiderController {
  constructor(
    @repository(ArticleSpiderRepository)
    public articleSpiderRepository : ArticleSpiderRepository,
  ) {}

  @post('/article-spiders', {
    responses: {
      '200': {
        description: 'ArticleSpider model instance',
        content: {'application/json': {schema: getModelSchemaRef(ArticleSpider)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSpider, {
            title: 'NewArticleSpider',
            exclude: ['id'],
          }),
        },
      },
    })
    articleSpider: Omit<ArticleSpider, 'id'>,
  ): Promise<ArticleSpider> {
    return this.articleSpiderRepository.create(articleSpider);
  }

  @get('/article-spiders/count', {
    responses: {
      '200': {
        description: 'ArticleSpider model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ArticleSpider) where?: Where<ArticleSpider>,
  ): Promise<Count> {
    return this.articleSpiderRepository.count(where);
  }

  @get('/article-spiders', {
    responses: {
      '200': {
        description: 'Array of ArticleSpider model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ArticleSpider, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ArticleSpider) filter?: Filter<ArticleSpider>,
  ): Promise<ArticleSpider[]> {
    return this.articleSpiderRepository.find(filter);
  }

  @patch('/article-spiders', {
    responses: {
      '200': {
        description: 'ArticleSpider PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSpider, {partial: true}),
        },
      },
    })
    articleSpider: ArticleSpider,
    @param.where(ArticleSpider) where?: Where<ArticleSpider>,
  ): Promise<Count> {
    return this.articleSpiderRepository.updateAll(articleSpider, where);
  }

  @get('/article-spiders/{id}', {
    responses: {
      '200': {
        description: 'ArticleSpider model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ArticleSpider, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ArticleSpider, {exclude: 'where'}) filter?: FilterExcludingWhere<ArticleSpider>
  ): Promise<ArticleSpider> {
    return this.articleSpiderRepository.findById(id, filter);
  }

  @patch('/article-spiders/{id}', {
    responses: {
      '204': {
        description: 'ArticleSpider PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSpider, {partial: true}),
        },
      },
    })
    articleSpider: ArticleSpider,
  ): Promise<void> {
    await this.articleSpiderRepository.updateById(id, articleSpider);
  }

  @put('/article-spiders/{id}', {
    responses: {
      '204': {
        description: 'ArticleSpider PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() articleSpider: ArticleSpider,
  ): Promise<void> {
    await this.articleSpiderRepository.replaceById(id, articleSpider);
  }

  @del('/article-spiders/{id}', {
    responses: {
      '204': {
        description: 'ArticleSpider DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.articleSpiderRepository.deleteById(id);
  }
}
