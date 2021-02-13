import { Entity, model, property } from '@loopback/repository';

@model()
export class ArticleSearchResultInfo extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  articleId: number;

  constructor(data?: Partial<ArticleSearchResultInfo>) {
    super(data);
  }
}

export interface ArticleSearchResultInfoRelations {
  // describe navigational properties here
}

export type ArticleSearchResultInfoWithRelations = ArticleSearchResultInfo & ArticleSearchResultInfoRelations;
