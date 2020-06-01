import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  ArticleSource,
  ArticleSpider,
} from '../models';
import {ArticleSourceRepository} from '../repositories';

export class ArticleSourceArticleSpiderController {
  constructor(
    @repository(ArticleSourceRepository) protected articleSourceRepository: ArticleSourceRepository,
  ) { }

  @get('/article-sources/{id}/article-spiders', {
    responses: {
      '200': {
        description: 'Array of ArticleSource has many ArticleSpider',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ArticleSpider)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<ArticleSpider>,
  ): Promise<ArticleSpider[]> {
    return this.articleSourceRepository.spiders(id).find(filter);
  }

  @post('/article-sources/{id}/article-spiders', {
    responses: {
      '200': {
        description: 'ArticleSource model instance',
        content: {'application/json': {schema: getModelSchemaRef(ArticleSpider)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof ArticleSource.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSpider, {
            title: 'NewArticleSpiderInArticleSource',
            exclude: ['id'],
            optional: ['sourceId']
          }),
        },
      },
    }) articleSpider: Omit<ArticleSpider, 'id'>,
  ): Promise<ArticleSpider> {
    return this.articleSourceRepository.spiders(id).create(articleSpider);
  }

  @patch('/article-sources/{id}/article-spiders', {
    responses: {
      '200': {
        description: 'ArticleSource.ArticleSpider PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleSpider, {partial: true}),
        },
      },
    })
    articleSpider: Partial<ArticleSpider>,
    @param.query.object('where', getWhereSchemaFor(ArticleSpider)) where?: Where<ArticleSpider>,
  ): Promise<Count> {
    return this.articleSourceRepository.spiders(id).patch(articleSpider, where);
  }

  @del('/article-sources/{id}/article-spiders', {
    responses: {
      '200': {
        description: 'ArticleSource.ArticleSpider DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(ArticleSpider)) where?: Where<ArticleSpider>,
  ): Promise<Count> {
    return this.articleSourceRepository.spiders(id).delete(where);
  }
}
