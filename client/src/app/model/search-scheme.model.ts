import { FieldInfo } from "../services/utils/shared.model";

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
  enabled: boolean;

  constructor(r: SearchSchemePayload, kind: SearchSchemeKind) {
    this.id = r.id;
    this.name = r.name;
    this.description = r.description;
    this.version = r.version;
    this.createdAt = r.createdAt ? new Date(r.createdAt) : null;
    this.updatedAt = r.updatedAt ? new Date(r.updatedAt) : null;
    this.enabled = r.enabled;
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
  enabled: boolean;
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

export const ArticlePartInfo: { [key in ArticlePart]: FieldInfo } = {
  url: { value: 'url', label: 'URL' },
  title: { value: 'title', label: 'Title' },
  text: { value: 'text', label: 'Text' },
};


export enum MatchCondition {
  contains = 'contains',
  notContains = 'notContains',
}

export const MatchConditionInfo: { [key in MatchCondition]: FieldInfo } = {
  contains: { value: 'contains', label: 'Contains' },
  notContains: { value: 'notContains', label: 'Not contains' },
};


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

export enum SecondaryConditionField {
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

export const SecondaryConditionFieldInfo: { [key in SecondaryConditionField]: FieldInfo } = {
  'source.name': { value: 'source.name', label: 'Source > Name' },
  'source.url': { value: 'source.url', label: 'Source > URL' },
  'source.country': { value: 'source.country', label: 'Source > Country' },
  'source.region': { value: 'source.region', label: 'Source > Region' },
  'source.red_circle': { value: 'source.red_circle', label: 'Source > Red circle' },
  'source.tier': { value: 'source.tier', label: 'Source > Tier' },
  'source.reach': { value: 'source.reach', label: 'Source > Reach' },
  'source.ad_value_500': { value: 'source.ad_value_500', label: 'Source > Ad value 5' },
  'source.ad_value_150': { value: 'source.ad_value_150', label: 'Source > Ad value 1,5' },
  'source.parse_category': { value: 'source.parse_category', label: 'Source > Parse category' },
  'details.scraped_at': { value: 'details.scraped_at', label: 'Details > Scraped at' },
  'details.parse_function': { value: 'details.parse_function', label: 'Details > Parse function' },
  'details.result': { value: 'details.result', label: 'Details > Result' },
  'spider.kind': { value: 'spider.kind', label: 'Spider > Kind' },
};

export enum SecondaryCondition {
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

export const SecondaryConditionInfo:
  { [key in SecondaryCondition]: FieldInfo<{ numberOfParams: number | 'unlimited' }> } = {
  equals: { value: 'equals', label: 'Equals', options: { numberOfParams: 1 } },
  notEquals: { value: 'notEquals', label: 'Not equals', options: { numberOfParams: 1 } },
  contains: { value: 'contains', label: 'Contains', options: { numberOfParams: 1 } },
  notContains: { value: 'notContains', label: 'Not contains', options: { numberOfParams: 1 } },
  startsWith: { value: 'startsWith', label: 'Starts with', options: { numberOfParams: 1 } },
  notStartsWith: { value: 'notStartsWith', label: 'Not starts with', options: { numberOfParams: 1 } },
  endsWith: { value: 'endsWith', label: 'Ends with', options: { numberOfParams: 1 } },
  notEndsWith: { value: 'notEndsWith', label: 'Not ends with', options: { numberOfParams: 1 } },
  greaterThan: { value: 'greaterThan', label: 'Greater than', options: { numberOfParams: 1 } },
  greaterOrEqual: { value: 'greaterOrEqual', label: 'Greater or equal', options: { numberOfParams: 1 } },
  lessThan: { value: 'lessThan', label: 'Less than', options: { numberOfParams: 1 } },
  lessOrEqual: { value: 'lessOrEqual', label: 'Less or equal', options: { numberOfParams: 1 } },
  in: { value: 'in', label: 'In list', options: { numberOfParams: 'unlimited' } },
  notIn: { value: 'notIn', label: 'Not in list', options: { numberOfParams: 'unlimited' } },
  isNull: { value: 'isNull', label: 'Is null', options: { numberOfParams: 0 } },
  isNotNull: { value: 'isNotNull', label: 'Is not null', options: { numberOfParams: 0 } },
};

export interface ArticleSecondaryMatchCondition {
  field: SecondaryConditionField;
  condition: SecondaryCondition;
  params: string[];
}
