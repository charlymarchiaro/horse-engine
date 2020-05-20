import { ArticleFilteringScheme, ArticlePart, MatchCondition } from './model';


export function getArticleFilteringSchemeString(scheme: ArticleFilteringScheme) {
  let result = '';

  scheme.conditions.forEach(
    (andGroup, andGroupId) => {

      if (andGroupId > 0) {
        result += `\n< OR >\n`;
      }

      andGroup.forEach(
        (condition, conditionId) => {

          const part = condition.part;

          const matchCondition = condition.matchCondition === MatchCondition.contains
            ? 'contains'
            : 'not contains';

          const textToMatch = condition.textToMatch;

          const caseSensitiveness = condition.caseSensitive
            ? 'case sensitive'
            : 'case insensitive';

          result += `${conditionId + 1}. ${part} > ${matchCondition} > ${textToMatch} > ${caseSensitiveness} \n`;
        }
      );
    }
  );

  return result;
}

