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
  Article,
} from '../models';
import {ArticleSourceRepository} from '../repositories';

export class ArticleSourceArticleController {
  constructor(
    @repository(ArticleSourceRepository) protected articleSourceRepository: ArticleSourceRepository,
  ) { }

  @get('/article-sources/{id}/articles', {
    responses: {
      '200': {
        description: 'Array of ArticleSource has many Article',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Article)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Article>,
  ): Promise<Article[]> {
    return this.articleSourceRepository.articles(id).find(filter);
  }

  @post('/article-sources/{id}/articles', {
    responses: {
      '200': {
        description: 'ArticleSource model instance',
        content: {'application/json': {schema: getModelSchemaRef(Article)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof ArticleSource.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {
            title: 'NewArticleInArticleSource',
            exclude: ['id'],
            optional: ['articleSourceId']
          }),
        },
      },
    }) article: Omit<Article, 'id'>,
  ): Promise<Article> {
    return this.articleSourceRepository.articles(id).create(article);
  }

  @patch('/article-sources/{id}/articles', {
    responses: {
      '200': {
        description: 'ArticleSource.Article PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Article, {partial: true}),
        },
      },
    })
    article: Partial<Article>,
    @param.query.object('where', getWhereSchemaFor(Article)) where?: Where<Article>,
  ): Promise<Count> {
    return this.articleSourceRepository.articles(id).patch(article, where);
  }

  @del('/article-sources/{id}/articles', {
    responses: {
      '200': {
        description: 'ArticleSource.Article DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Article)) where?: Where<Article>,
  ): Promise<Count> {
    return this.articleSourceRepository.articles(id).delete(where);
  }
}
