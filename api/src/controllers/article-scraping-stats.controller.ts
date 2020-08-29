import { inject } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { get, post, requestBody, api, HttpErrors } from '@loopback/rest';
import { model, property } from '@loopback/repository';
import { ArticleScrapingStatsAccumRepository } from '../repositories/article-scraping-stats-accum.repository';
import { ArticleScrapingStatsDynRepository } from '../repositories/article-scraping-stats-dyn.repository';
import { SimpleApiResponse } from '../globals';
import { ArticleScrapingStats } from '../models/article-scraping-stats.model';
import { ArticleScrapingStatsRepository } from '../repositories/article-scraping-stats.repository';


@model()
export class ArticleScrapingFullStatsResponse {
  @property.array(ArticleScrapingStats) sources: ArticleScrapingStats[];
  @property() total: ArticleScrapingStats;
}


@api({ basePath: 'article-stats' })
export class ArticleScrapingStatsController {
  constructor(
    @repository(ArticleScrapingStatsAccumRepository)
    public statsAccumRepository: ArticleScrapingStatsAccumRepository,
    @repository(ArticleScrapingStatsDynRepository)
    public statsDynRepository: ArticleScrapingStatsDynRepository,
    @repository(ArticleScrapingStatsRepository)
    public statsRepository: ArticleScrapingStatsRepository,
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


  @get('/full-stats', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': ArticleScrapingFullStatsResponse },
          },
        },
      },
    },
  })
  async fullStats(): Promise<ArticleScrapingFullStatsResponse> {

    const sources = await this.statsRepository.getStatsPerSource();
    const total = await this.statsRepository.getStatsTotal();

    return { sources, total };
  }
}