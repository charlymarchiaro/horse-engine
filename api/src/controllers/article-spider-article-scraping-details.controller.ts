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
  ArticleSpider,
  ArticleScrapingDetails,
} from '../models';
import {ArticleSpiderRepository} from '../repositories';

export class ArticleSpiderArticleScrapingDetailsController {
  constructor(
    @repository(ArticleSpiderRepository) protected articleSpiderRepository: ArticleSpiderRepository,
  ) { }

  @get('/article-spiders/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'Array of ArticleSpider has many ArticleScrapingDetails',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(ArticleScrapingDetails)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<ArticleScrapingDetails>,
  ): Promise<ArticleScrapingDetails[]> {
    return this.articleSpiderRepository.articleScrapingDetails(id).find(filter);
  }

  @post('/article-spiders/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'ArticleSpider model instance',
        content: {'application/json': {schema: getModelSchemaRef(ArticleScrapingDetails)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof ArticleSpider.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleScrapingDetails, {
            title: 'NewArticleScrapingDetailsInArticleSpider',
            exclude: ['id'],
            optional: ['articleSpiderId']
          }),
        },
      },
    }) articleScrapingDetails: Omit<ArticleScrapingDetails, 'id'>,
  ): Promise<ArticleScrapingDetails> {
    return this.articleSpiderRepository.articleScrapingDetails(id).create(articleScrapingDetails);
  }

  @patch('/article-spiders/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'ArticleSpider.ArticleScrapingDetails PATCH success count',
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
    return this.articleSpiderRepository.articleScrapingDetails(id).patch(articleScrapingDetails, where);
  }

  @del('/article-spiders/{id}/article-scraping-details', {
    responses: {
      '200': {
        description: 'ArticleSpider.ArticleScrapingDetails DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(ArticleScrapingDetails)) where?: Where<ArticleScrapingDetails>,
  ): Promise<Count> {
    return this.articleSpiderRepository.articleScrapingDetails(id).delete(where);
  }
}
