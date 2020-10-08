import { Model, model, property } from '@loopback/repository';
import { ArticleMatchCondition } from './article-match-condition.model';
import { ArticleSecondaryMatchCondition } from './article-secondary-match-condition.model';
import { SearchDateSpan } from './search-date-span.model';

@model()
export class ArticleMatchConditionOrGroup {
  @property.array(ArticleMatchCondition)
  and: ArticleMatchCondition[]
}

@model()
export class ArticleMatchConditionSet {
  @property.array(ArticleMatchConditionOrGroup)
  or: ArticleMatchConditionOrGroup[]
}


@model()
export class ArticleBooleanQuery extends Model {

  constructor(data?: Partial<ArticleBooleanQuery>) {
    super(data);
  }

  @property(String)
  pidTag: string;

  @property(ArticleMatchConditionSet)
  matchConditions: ArticleMatchConditionSet;

  @property.array(ArticleSecondaryMatchCondition)
  secondaryMatchConditions: ArticleSecondaryMatchCondition[];

  @property(SearchDateSpan)
  dateSpan: SearchDateSpan;
}

export interface ArticleBooleanQueryRelations {
  // describe navigational properties here
}

export type ArticleBooleanQueryWithRelations = ArticleBooleanQuery & ArticleBooleanQueryRelations;
