import { Model, model, property } from '@loopback/repository';


// Filters

export enum Field {
  sourceName = 'source.name',
  sourceUrl = 'source.url',
  sourceCountry = 'source.country',
  sourceRegion = 'source.region',
  sourceRedCircle = 'source.red_circle',
  sourceTier = 'source.tier',
  sourceReach = 'source.reach',
  sourceAdValue500 = 'source.ad_value_500',
  sourceAdValue150 = 'source.ad_value_150',
  sourceParseCategory = 'source.parse_category',
  detailsScrapedAt = 'details.scraped_at',
  detailsParseFunction = 'details.parse_function',
  detailsResult = 'details.result',
  spiderKind = 'spider.kind',
}

export enum Condition {
  equals = 'equals',
  notEquals = 'notEquals',
  contains = 'contains',
  notContains = 'notContains',
  startsWith = 'startsWith',
  notStartsWith = 'notStartsWith',
  endsWith = 'endsWith',
  notEndsWith = 'notEndsWith',
  greaterThan = 'greaterThan',
  greaterOrEqual = 'greaterOrEqual',
  lessThan = 'lessThan',
  lessOrEqual = 'lessOrEqual',
  in = 'in',
  notIn = 'notIn',
  isNull = 'isNull',
  isNotNull = 'isNotNull',
}


@model()
export class ArticleSecondaryMatchCondition extends Model {
  @property({
    type: 'string',
    required: true,
  })
  field: Field;

  @property({
    type: 'string',
    required: true,
  })
  condition: Condition;

  @property.array(String)
  params: string[];


  constructor(data?: Partial<ArticleSecondaryMatchCondition>) {
    super(data);
  }
}

export interface ArticleSecondaryMatchConditionRelations {
  // describe navigational properties here
}

export type ArticleSecondaryMatchConditionWithRelations = ArticleSecondaryMatchCondition & ArticleSecondaryMatchConditionRelations;
