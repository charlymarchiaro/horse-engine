import { ArticleMatchConditionSet, ArticleSecondaryMatchCondition, SearchSchemeKind } from './search-scheme.model';
import { DateSpan } from '../components/keyword-search/model';
import { BehaviorSubject } from 'rxjs';


export const DEFAULT_DAYS_PER_PART = 7;
export const PART_SEARCH_NUMBER_OF_TRIES = 3;


export interface ArticleSearchBooleanQueryPayload {
  pidTag: string;
  matchConditions: ArticleMatchConditionSet;
  secondaryMatchConditions: ArticleSecondaryMatchCondition[];
  dateSpan: DateSpan;
}

export interface ArticleSearchBooleanQueryResponse {
  pidTag: string;
  dateSpan: {
    fromDateIncl: string;
    toDateIncl: string;
  };
  articleIds: string[];
}


export class ArticleSearchBooleanQueryResult {
  pidTag: string;
  dateSpan: DateSpan;
  articleIds: string[];

  constructor(r: ArticleSearchBooleanQueryResponse) {
    this.pidTag = r.pidTag;
    this.dateSpan = {
      fromDateIncl: new Date(r.dateSpan.fromDateIncl),
      toDateIncl: new Date(r.dateSpan.toDateIncl),
    };
    this.articleIds = r.articleIds;
  }
}


export enum SearchState {
  idle = 'idle',
  searching = 'searching',
  cancelling = 'cancelling',
}


export interface SearchResultsPart {
  partIndex: number;
  dateSpan: DateSpan;
  itemIds: string[];
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


export class SearchResults {

  private kindSubject = new BehaviorSubject<SearchSchemeKind>(null);
  public kind$ = this.kindSubject.asObservable();

  private partsSubject = new BehaviorSubject<SearchResultsPart[]>([]);
  public part$ = this.partsSubject.asObservable();

  private daysPerPartSubject = new BehaviorSubject<number>(null);
  public daysPerPart$ = this.daysPerPartSubject.asObservable();

  private progressPercentSubject = new BehaviorSubject<number>(0);
  public progressPercent$ = this.progressPercentSubject.asObservable();

  private totalPartsCountSubject = new BehaviorSubject<number>(0);
  public totalPartsCount$ = this.totalPartsCountSubject.asObservable();

  get retrievedPartsCount() { return this.partsSubject.getValue().length; }


  public init(
    kind: SearchSchemeKind,
    daysPerPart: number,
    totalPartsCount: number,
  ) {
    this.kindSubject.next(kind);
    this.daysPerPartSubject.next(daysPerPart);
    this.partsSubject.next([]);
    this.totalPartsCountSubject.next(totalPartsCount);
    this.progressPercentSubject.next(0);
  }

  public reset() {
    this.kindSubject.next(null);
    this.daysPerPartSubject.next(null);
    this.partsSubject.next([]);
    this.totalPartsCountSubject.next(0);
    this.progressPercentSubject.next(0);
  }

  public addPart(dateSpan: DateSpan, itemIds: string[]) {
    this.partsSubject.next([
      ...this.partsSubject.getValue(),
      ({
        partIndex: this.retrievedPartsCount,
        dateSpan,
        itemIds,
      })
    ]);

    const totalPartsCount = this.totalPartsCountSubject.getValue();

    this.progressPercentSubject.next(
      totalPartsCount !== 0
        ? 100.0 * this.retrievedPartsCount / totalPartsCount
        : 0
    );
  }
}
