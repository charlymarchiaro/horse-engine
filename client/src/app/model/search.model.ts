import { ArticleMatchConditionSet, ArticleSecondaryMatchCondition, SearchSchemeKind, SearchScheme, ArticleSearchSchemeImpl } from './search-scheme.model';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Article } from './article.model';
import { addDays, getDateDiffDays, replaceAll } from '../services/utils/utils';


export const DEFAULT_DAYS_PER_PART = 7;
export const PART_SEARCH_NUMBER_OF_TRIES = 3;


export interface DateSpan {
  fromDateIncl: Date;
  toDateIncl: Date;
}


export const getDateSpanDates = (dateSpan: DateSpan): Date[] => {
  const date1 = dateSpan.fromDateIncl;
  const date2 = dateSpan.toDateIncl;

  const dateDiff = getDateDiffDays(date1, date2);
  const dates: Date[] = [];

  for (let i = 0; i < dateDiff + 1; i++) {
    dates.push(addDays(date1, i));
  }
  return dates;
};



export namespace ArticleBooleanQueryResultsStats {
  export class CategoryStats {
    articleSourceId?: string;
    matchCount: number;
    titleMatchCount: number;
  }

  export class DailyStats {
    date: string;
    articleSources: CategoryStats[];
    total: CategoryStats;
  }

  export class Stats {
    dates: DailyStats[];
  }
}


export interface ArticleSearchBooleanQueryPayload {
  pidTag: string;
  matchConditions: ArticleMatchConditionSet;
  secondaryMatchConditions: ArticleSecondaryMatchCondition[];
  titleMatchKeywords: string[];
  dateSpan: DateSpan;
  excludeDuplicates: boolean;
}

export interface ArticleSearchBooleanQueryResponse {
  pidTag: string;
  dateSpan: {
    fromDateIncl: string;
    toDateIncl: string;
  };
  articleIds: string[];
  stats: ArticleBooleanQueryResultsStats.Stats;
}


export class ArticleSearchBooleanQueryResult {
  pidTag: string;
  dateSpan: DateSpan;
  articleIds: string[];
  stats: ArticleBooleanQueryResultsStats.Stats;

  constructor(r: ArticleSearchBooleanQueryResponse) {
    this.pidTag = r.pidTag;
    this.dateSpan = {
      fromDateIncl: new Date(r.dateSpan.fromDateIncl),
      toDateIncl: new Date(r.dateSpan.toDateIncl),
    };
    this.articleIds = r.articleIds;
    this.stats = r.stats;
  }
}


export class HighlightedArticle {
  public markedTitleHtml: string;
  public markedTextHtml: string;

  constructor(public article: Article, scheme: ArticleSearchSchemeImpl) {

    const mapObj = scheme.titleMatchKeywords.reduce(
      (map, keyword) => {
        map[keyword] = `<mark>${keyword}</mark>`;
        return map;
      }, {}
    );

    this.markedTitleHtml = article.title
      ? replaceAll(article.title, mapObj)
      : null;

    this.markedTextHtml = article.text
      ? replaceAll(article.text, mapObj)
      : null;
  }
}


export interface CancelSearchRequest {
  pidTag: string;
}


export interface CancelSearchResponse {
  pidTerminated: number[];
  pidNotTerminated: number[];
}


export enum SearchState {
  idle = 'idle',
  searching = 'searching',
  cancelling = 'cancelling',
}


export interface SearchParams {
  scheme: SearchScheme;
  dateSpan: DateSpan;
  excludeDuplicates: boolean;
}


export interface SearchResultsPart {
  partIndex: number;
  dateSpan: DateSpan;
  itemIds: string[];
  stats: ArticleBooleanQueryResultsStats.Stats;
}


export enum ResultStatus {
  success = 'success',
  error = 'error',
  cancelled = 'cancelled',
}

export interface ResultInfo {
  status: ResultStatus;
  message?: string;
}


export interface TimeElapsedInfo {
  startTime: Date;
  timeElapsedSecs: number;
  timeElapsedLabel: string;
}


export class SearchResults {

  private kindSubject = new BehaviorSubject<SearchSchemeKind>(null);
  public kind$ = this.kindSubject.asObservable();

  private partsSubject = new BehaviorSubject<SearchResultsPart[]>([]);
  public parts$ = this.partsSubject.asObservable();

  private newPartSubject = new BehaviorSubject<SearchResultsPart>(null);
  public newPart$ = this.newPartSubject.asObservable();

  private daysPerPartSubject = new BehaviorSubject<number>(null);
  public daysPerPart$ = this.daysPerPartSubject.asObservable();

  private progressPercentSubject = new BehaviorSubject<number>(0);
  public progressPercent$ = this.progressPercentSubject.asObservable();

  private totalPartsCountSubject = new BehaviorSubject<number>(0);
  public totalPartsCount$ = this.totalPartsCountSubject.asObservable();

  private totalItemsCountSubject = new BehaviorSubject<number>(0);
  public totalItemsCount$ = this.totalItemsCountSubject.asObservable().pipe(
    // Update on value change only
    distinctUntilChanged()
  );


  get retrievedPartsCount() { return this.partsSubject.getValue().length; }

  get itemIds() {
    return this.partsSubject.getValue()
      .map(p => p.itemIds)
      .reduce((list, part) => [...list, ...part], []);
  }

  get totalItemsCount() {
    return this.partsSubject.getValue().reduce(
      (total, p) => total + p.itemIds.length, 0
    );
  }

  get stats(): ArticleBooleanQueryResultsStats.Stats {
    return {
      dates: this.partsSubject.getValue()
        .map(p => p.stats.dates)
        .reduce((list, part) => [...list, ...part], [])
    };
  }

  get progressPercent() { return this.progressPercentSubject.getValue(); }


  public init(
    kind: SearchSchemeKind,
    daysPerPart: number,
    totalPartsCount: number,
  ) {
    this.kindSubject.next(kind);
    this.daysPerPartSubject.next(daysPerPart);
    this.partsSubject.next([]);
    this.newPartSubject.next(null);
    this.totalPartsCountSubject.next(totalPartsCount);
    this.progressPercentSubject.next(0);
  }

  public reset() {
    this.kindSubject.next(null);
    this.daysPerPartSubject.next(null);
    this.partsSubject.next([]);
    this.newPartSubject.next(null);
    this.totalPartsCountSubject.next(0);
    this.progressPercentSubject.next(0);
    this.totalItemsCountSubject.next(0);
  }

  public addPart(
    dateSpan: DateSpan,
    itemIds: string[],
    stats: ArticleBooleanQueryResultsStats.Stats
  ) {
    this.partsSubject.next([
      ...this.partsSubject.getValue(),
      ({
        partIndex: this.retrievedPartsCount,
        dateSpan,
        itemIds,
        stats,
      })
    ]);

    this.newPartSubject.next({
      partIndex: this.retrievedPartsCount,
      dateSpan,
      itemIds,
      stats,
    });

    const totalPartsCount = this.totalPartsCountSubject.getValue();
    this.totalItemsCountSubject.next(this.totalItemsCount);

    this.progressPercentSubject.next(
      totalPartsCount !== 0
        ? 100.0 * this.retrievedPartsCount / totalPartsCount
        : 0
    );
  }

  public getPaginatedItemIds(itemsPerPage: number, pageIndex: number): string[] {

    const itemsCount = this.totalItemsCount;
    const parts = this.partsSubject.getValue();

    const firstItemIndex = Math.min(pageIndex * itemsPerPage, itemsCount);
    const lastItemIndex = Math.min((pageIndex + 1) * itemsPerPage - 1, itemsCount);

    // Find the parts that contains the first and last item

    let firstPartIndex;
    let firstItemOffset;
    let lastPartIndex;
    let accumCount;

    // First part
    accumCount = 0;
    for (let i = 0; i < parts.length; i++) {

      firstItemOffset = firstItemIndex - accumCount;
      accumCount += parts[i].itemIds.length;
      firstPartIndex = i;

      if (accumCount - 1 >= firstItemIndex) {
        break;
      }
    }

    // Last part
    accumCount = 0;
    for (let i = 0; i < parts.length; i++) {

      accumCount += parts[i].itemIds.length;
      lastPartIndex = i;

      if (accumCount - 1 >= lastItemIndex) {
        break;
      }
    }

    // Add items to result
    const result = parts
      .filter((p, i) => i >= firstPartIndex && i <= lastPartIndex)
      .reduce((list, part) => [...list, ...part.itemIds], [])
      .slice(firstItemOffset, firstItemOffset + itemsPerPage);

    return result;
  }
}
