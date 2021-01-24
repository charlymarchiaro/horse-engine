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

// Results stats
export namespace ArticleBooleanQueryResultsStats {

  @model()
  export class CategoryStats {
    @property(String) articleSourceId?: string;
    @property(Number) matchCount: number;
    @property(Number) titleMatchCount: number;
  }

  @model()
  export class DailyStats {
    @property(String) date: string;
    @property.array(CategoryStats) articleSources: CategoryStats[];
    @property(CategoryStats) total: CategoryStats;
  }

  @model()
  export class Stats {
    @property.array(DailyStats) dates: DailyStats[];
  }
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

  @property.array(String)
  titleMatchKeywords: string[];

  @property(SearchDateSpan)
  dateSpan: SearchDateSpan;

  @property(Boolean)
  excludeDuplicates: boolean;
}

export interface ArticleBooleanQueryRelations {
  // describe navigational properties here
}

export type ArticleBooleanQueryWithRelations = ArticleBooleanQuery & ArticleBooleanQueryRelations;
