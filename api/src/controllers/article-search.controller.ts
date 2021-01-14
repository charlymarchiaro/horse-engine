import { authenticate } from '@loopback/authentication';

import { inject } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { get, post, requestBody, api, HttpErrors, RestBindings, Response } from '@loopback/rest';
import { model, property } from '@loopback/repository';
import { ArticleSearchRepository } from '../repositories/article-search.repository';
import { ArticleBooleanQuery } from '../models';
import { SearchDateSpan } from '../models/search-date-span.model';
import { AppConstants } from '../keys';
import { authorize } from '@loopback/authorization';
import { Role } from '../models/role.model';
import { basicAuthorization } from '../services';


@model()
export class ArticleSearchResponse {
  @property(String) pidTag: string;
  @property(SearchDateSpan) dateSpan: SearchDateSpan;
  @property.array(String) articleIds: string[];
}


@model()
export class CancelSearchRequest {
  @property(String) pidTag: string;
}


@model()
export class CancelSearchResponse {
  @property({ type: 'array', itemType: 'number' }) pidTerminated: number[];
  @property({ type: 'array', itemType: 'number' }) pidNotTerminated: number[];
}


@authenticate('jwt')
@authorize({ allowedRoles: [Role.ROLE_USER], voters: [basicAuthorization] })
@api({ basePath: 'article-search' })
export class ArticleSearchController {
  constructor(
    @repository(ArticleSearchRepository)
    public articleSearchRepository: ArticleSearchRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {
    // Extending timeout from the default 120s
    // https://stackoverflow.com/questions/57673829/how-can-i-set-timeout-in-lb4
    (this.response as any).setTimeout(AppConstants.RESPONSE_TIMEOUT_SECS * 1000);
  }


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

    const response = await this.articleSearchRepository.executeBooleanQuery(body);

    return response;
  }


  @post('/cancel-search', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': CancelSearchResponse },
          },
        },
      },
    },
  })
  async cancelSearch(
    @requestBody({
      content: {
        'application/json': {
          schema: { 'x-ts-type': CancelSearchRequest },
        }
      },
    })
    body: CancelSearchRequest,
  ): Promise<CancelSearchResponse> {

    const response = await this.articleSearchRepository.cancelSearch(body);

    return response;
  }
}
