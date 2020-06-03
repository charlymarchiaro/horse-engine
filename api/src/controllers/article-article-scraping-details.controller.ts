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
  Article,
  ArticleScrapingDetails,
} from '../models';
import {ArticleRepository} from '../repositories';

export class ArticleArticleScrapingDetailsController {
  constructor(
    @repository(ArticleRepository) protected articleRepository: ArticleRepository,
  ) { }

  @get('/articles/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'Article has one ArticleScrapingDetails',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ArticleScrapingDetails),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ArticleScrapingDetails>,
  ): Promise<ArticleScrapingDetails> {
    return this.articleRepository.articleScrapingDetails(id).get(filter);
  }

  @post('/articles/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'Article model instance',
        content: {'application/json': {schema: getModelSchemaRef(ArticleScrapingDetails)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Article.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleScrapingDetails, {
            title: 'NewArticleScrapingDetailsInArticle',
            exclude: ['id'],
            optional: ['articleId']
          }),
        },
      },
    }) articleScrapingDetails: Omit<ArticleScrapingDetails, 'id'>,
  ): Promise<ArticleScrapingDetails> {
    return this.articleRepository.articleScrapingDetails(id).create(articleScrapingDetails);
  }

  @patch('/articles/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'Article.ArticleScrapingDetails PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleScrapingDetails, {partial: true}),
        },
      },
    })
    articleScrapingDetails: Partial<ArticleScrapingDetails>,
    @param.query.object('where', getWhereSchemaFor(ArticleScrapingDetails)) where?: Where<ArticleScrapingDetails>,
  ): Promise<Count> {
    return this.articleRepository.articleScrapingDetails(id).patch(articleScrapingDetails, where);
  }

  @del('/articles/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'Article.ArticleScrapingDetails DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ArticleScrapingDetails)) where?: Where<ArticleScrapingDetails>,
  ): Promise<Count> {
    return this.articleRepository.articleScrapingDetails(id).delete(where);
  }
}