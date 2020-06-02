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


export function getArticleFilteringSchemeWhereCondition(
  scheme: ArticleFilteringScheme
): any {

  const orGroupWhereConditions = [];

  scheme.conditions.forEach(andGroup => {
    const andGroupWhereConditions = [];

    andGroup.forEach(condition => {
      const op = getArticleFilteringConditionWhereOperator(condition);

      andGroupWhereConditions.push({
        [condition.part]: { [op]: `%${condition.textToMatch}%` }
      });
    });

    orGroupWhereConditions.push({ and: andGroupWhereConditions });
  });

  return { or: orGroupWhereConditions };
}


export function getArticleFilteringConditionWhereOperator(
  condition: ArticleFilteringCondition
): string {

  switch (condition.matchCondition) {
    case MatchCondition.contains:
      return condition.caseSensitive ? 'like' : 'ilike';

    case MatchCondition.notContains:
      return condition.caseSensitive ? 'nlike' : 'nilike';

    default:
      throw Error('Not implemented match condition: ' + condition.matchCondition);
  }
}
