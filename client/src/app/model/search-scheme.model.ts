export enum SearchSchemeKind {
  article = 'article',
}


export class SearchScheme {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  kind: SearchSchemeKind;
  scheme: SearchSchemeImpl;

  constructor(r: SearchSchemePayload, kind: SearchSchemeKind) {
    this.id = r.id;
    this.name = r.name;
    this.description = r.description;
    this.version = r.version;
    this.createdAt = r.createdAt ? new Date(r.createdAt) : null;
    this.updatedAt = r.updatedAt ? new Date(r.updatedAt) : null;
    this.kind = kind;

    if (kind === SearchSchemeKind.article) { this.scheme = r.scheme as ArticleSearchSchemeImpl; }
  }
}

export interface SearchSchemePayload {
  id?: string;
  name: string;
  description: string;
  version: string;
  createdAt?: string;
  updatedAt?: string;
  scheme: any;
}


// Implementations ------------------------------------------------------

export type SearchSchemeImpl =
  | ArticleSearchSchemeImpl
  ;


// Article

export interface ArticleSearchSchemeImpl {
  matchConditions: ArticleMatchConditionSet;
  secondaryMatchConditions: ArticleSecondaryMatchCondition[];
  titleMatchKeywords: string[];
}


// Primary match condition

export enum ArticlePart {
  url = 'url',
  title = 'title',
  text = 'text',
}

export enum MatchCondition {
  contains = 'contains',
  notContains = 'notContains',
}

export interface ArticleMatchCondition {
  part: ArticlePart;
  matchCondition: MatchCondition;
  textToMatch: string;
  caseSensitive: boolean;
}

export interface ArticleMatchConditionSet {
  or: { and: ArticleMatchCondition[] }[];
}


// Secondary match condition

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

export interface ArticleSecondaryMatchCondition {
  field: Field;
  condition: Condition;
  params: string[];
}
