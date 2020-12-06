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
import { ArticleSketch } from '../models';
import { ArticleSketchRepository } from '../repositories';

export class ArticleDupeDetectionController {
  constructor(
    @repository(ArticleSketchRepository)
    public articleSketchRepository: ArticleSketchRepository,
  ) { }

  @get('/article-sketches', {
    responses: {
      '200': {
        description: 'Array of ArticleSummary model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ArticleSketch, { includeRelations: false }),
            },
          },
        },
      },
    },
  })
  async findSketches(
    @param.filter(ArticleSketch) filter?: Filter<ArticleSketch>,
  ): Promise<ArticleSketch[]> {
    return this.articleSketchRepository.find(filter);
  }
}
