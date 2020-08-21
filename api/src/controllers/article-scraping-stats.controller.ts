import { inject } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { get, post, requestBody, api, HttpErrors } from '@loopback/rest';
import { model, property } from '@loopback/repository';
import { ArticleScrapingStatsAccumRepository } from '../repositories/article-scraping-stats-accum.repository';
import { ArticleScrapingStatsDynRepository } from '../repositories/article-scraping-stats-dyn.repository';
import { SimpleApiResponse } from '../globals';


@api({ basePath: 'article-stats' })
export class ArticleScrapingStatsController {
  constructor(
    @repository(ArticleScrapingStatsAccumRepository)
    public statsAccumRepository: ArticleScrapingStatsAccumRepository,
    @repository(ArticleScrapingStatsDynRepository)
    public statsDynRepository: ArticleScrapingStatsDynRepository,
  ) { }


  @get('/update-stats-tables', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': SimpleApiResponse },
          },
        },
      },
    },
  })
  async updateStatsTables(): Promise<SimpleApiResponse> {
    await this.statsAccumRepository.updateCurrentDateValues();
    await this.statsDynRepository.updateValues();

    return { status: 'success' };
  }
}
