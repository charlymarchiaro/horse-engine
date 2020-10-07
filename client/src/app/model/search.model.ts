import { ArticleMatchConditionSet, ArticleSecondaryMatchCondition, SearchSchemeKind } from './search-scheme.model';
import { DateSpan } from '../components/keyword-search/model';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';


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


export interface TimeElapsedInfo {
  startTime: Date;
  timeElapsedSecs: number;
  timeElapsedLabel: string;
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

  private totalItemsCountSubject = new BehaviorSubject<number>(0);
  public totalItemsCount$ = this.totalItemsCountSubject.asObservable().pipe(
    // Update on value change only
    distinctUntilChanged()
  );


  get retrievedPartsCount() { return this.partsSubject.getValue().length; }

  get totalItemsCount() {
    return this.partsSubject.getValue().reduce(
      (total, p) => total + p.itemIds.length, 0
    );
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
    this.totalPartsCountSubject.next(totalPartsCount);
    this.progressPercentSubject.next(0);
  }

  public reset() {
    this.kindSubject.next(null);
    this.daysPerPartSubject.next(null);
    this.partsSubject.next([]);
    this.totalPartsCountSubject.next(0);
    this.progressPercentSubject.next(0);
    this.totalItemsCountSubject.next(0);
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
