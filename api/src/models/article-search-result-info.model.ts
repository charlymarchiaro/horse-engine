import { Entity, model, property } from '@loopback/repository';

@model()
export class ArticleSearchResultInfo extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  articleId: string;

  constructor(data?: Partial<ArticleSearchResultInfo>) {
    super(data);
  }
}

export interface ArticleSearchResultInfoRelations {
  // describe navigational properties here
}

export type ArticleSearchResultInfoWithRelations = ArticleSearchResultInfo & ArticleSearchResultInfoRelations;
