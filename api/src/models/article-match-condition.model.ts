import { Model, model, property } from '@loopback/repository';


// Filters

export enum ArticlePart {
  url = 'url',
  title = 'title',
  text = 'text',
}

export enum MatchCondition {
  contains = 'contains',
  notContains = 'notContains',
}


@model()
export class ArticleMatchCondition extends Model {
  @property({
    type: 'string',
    required: true,
  })
  part: ArticlePart;

  @property({
    type: 'string',
    required: true,
  })
  matchCondition: MatchCondition;

  @property({
    type: 'string',
    required: true,
  })
  textToMatch: string;

  @property({
    type: 'boolean',
    required: true,
  })
  caseSensitive: boolean;


  constructor(data?: Partial<ArticleMatchCondition>) {
    super(data);
  }
}

export interface ArticleMatchConditionRelations {
  // describe navigational properties here
}

export type ArticleMatchConditionWithRelations = ArticleMatchCondition & ArticleMatchConditionRelations;
