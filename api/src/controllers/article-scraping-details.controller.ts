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
import {ArticleScrapingDetails} from '../models';
import {ArticleScrapingDetailsRepository} from '../repositories';

export class ArticleScrapingDetailsController {
  constructor(
    @repository(ArticleScrapingDetailsRepository)
    public articleScrapingDetailsRepository : ArticleScrapingDetailsRepository,
  ) {}

  @post('/article-scraping-details', {
    responses: {
      '200': {
        description: 'ArticleScrapingDetails model instance',
        content: {'application/json': {schema: getModelSchemaRef(ArticleScrapingDetails)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleScrapingDetails, {
            title: 'NewArticleScrapingDetails',
            exclude: ['id'],
          }),
        },
      },
    })
    articleScrapingDetails: Omit<ArticleScrapingDetails, 'id'>,
  ): Promise<ArticleScrapingDetails> {
    return this.articleScrapingDetailsRepository.create(articleScrapingDetails);
  }

  @get('/article-scraping-details/count', {
    responses: {
      '200': {
        description: 'ArticleScrapingDetails model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(ArticleScrapingDetails) where?: Where<ArticleScrapingDetails>,
  ): Promise<Count> {
    return this.articleScrapingDetailsRepository.count(where);
  }

  @get('/article-scraping-details', {
    responses: {
      '200': {
        description: 'Array of ArticleScrapingDetails model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ArticleScrapingDetails, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(ArticleScrapingDetails) filter?: Filter<ArticleScrapingDetails>,
  ): Promise<ArticleScrapingDetails[]> {
    return this.articleScrapingDetailsRepository.find(filter);
  }

  @patch('/article-scraping-details', {
    responses: {
      '200': {
        description: 'ArticleScrapingDetails PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleScrapingDetails, {partial: true}),
        },
      },
    })
    articleScrapingDetails: ArticleScrapingDetails,
    @param.where(ArticleScrapingDetails) where?: Where<ArticleScrapingDetails>,
  ): Promise<Count> {
    return this.articleScrapingDetailsRepository.updateAll(articleScrapingDetails, where);
  }

  @get('/article-scraping-details/{id}', {
    responses: {
      '200': {
        description: 'ArticleScrapingDetails model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ArticleScrapingDetails, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(ArticleScrapingDetails, {exclude: 'where'}) filter?: FilterExcludingWhere<ArticleScrapingDetails>
  ): Promise<ArticleScrapingDetails> {
    return this.articleScrapingDetailsRepository.findById(id, filter);
  }

  @patch('/article-scraping-details/{id}', {
    responses: {
      '204': {
        description: 'ArticleScrapingDetails PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ArticleScrapingDetails, {partial: true}),
        },
      },
    })
    articleScrapingDetails: ArticleScrapingDetails,
  ): Promise<void> {
    await this.articleScrapingDetailsRepository.updateById(id, articleScrapingDetails);
  }

  @put('/article-scraping-details/{id}', {
    responses: {
      '204': {
        description: 'ArticleScrapingDetails PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() articleScrapingDetails: ArticleScrapingDetails,
  ): Promise<void> {
    await this.articleScrapingDetailsRepository.replaceById(id, articleScrapingDetails);
  }

  @del('/article-scraping-details/{id}', {
    responses: {
      '204': {
        description: 'ArticleScrapingDetails DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.articleScrapingDetailsRepository.deleteById(id);
  }
}
