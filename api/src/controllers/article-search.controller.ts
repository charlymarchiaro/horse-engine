import { inject } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { get, post, requestBody, api, HttpErrors } from '@loopback/rest';
import { model, property } from '@loopback/repository';
import { ArticleSearchRepository } from '../repositories/article-search.repository';
import { ArticleBooleanQuery } from '../models';


@model()
export class ArticleSearchResponse {
  @property.array(String) articleIds: string[];
}


@api({ basePath: 'article-search' })
export class ArticleSearchController {
  constructor(
    @repository(ArticleSearchRepository)
    public searchResultInfoRepository: ArticleSearchRepository,
  ) { }


  @post('/boolean-query', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': ArticleSearchResponse },
          },
        },
      },
    },
  })
  async booleanQuery(
    @requestBody({
      content: {
        'application/json': {
          schema: { 'x-ts-type': ArticleBooleanQuery },
        }
      },
    })
    body: ArticleBooleanQuery,
  ): Promise<ArticleSearchResponse> {

    const articleIds = await this.searchResultInfoRepository.executeBooleanQuery(body);
    return { articleIds };
  }
}
