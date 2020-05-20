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

export interface ArticleFilteringCondition {
  part: ArticlePart;
  matchCondition: MatchCondition;
  textToMatch: string;
  caseSensitive: boolean;
}

export interface DateSpan {
  fromDateIncl: Date;
  toDateIncl: Date;
}

/**
 * Conditions are mapped to a boolean logic in thw following way:
 * [ [ c1, <AND> c2, <AND> c3], <OR> [ c4, <AND> c5], <OR> [c6] ]
 *
 * The atomic single condition should be expressed in the following way:
 * [ [ c1 ] ]
 */
export interface ArticleFilteringScheme {
  conditions: ArticleFilteringCondition[][];
}
