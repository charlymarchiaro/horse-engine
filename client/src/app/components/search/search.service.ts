import { Injectable, EventEmitter } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { DateSpan } from '../../model/search.model';
import { SearchScheme } from '../../model/search-scheme.model';
import { SearchState, SearchResults, DEFAULT_DAYS_PER_PART, SearchResultsPart, ResultInfo, ResultStatus, TimeElapsedInfo, SearchParams } from '../../model/search.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { getDateDiffDays, addDays, secondsToHMS, getDatePart } from '../../services/utils/utils';
import { PartSeqSearchHandler } from './part-seq-search-handler';




@Injectable({
  providedIn: 'root'
})
export class SearchService {


  private searchStateSubject = new BehaviorSubject<SearchState>(SearchState.idle);
  public searchState$ = this.searchStateSubject.asObservable();

  private searchParamsSubject = new BehaviorSubject<SearchParams>(null);
  public searchParams$ = this.searchParamsSubject.asObservable();
  public get searchParams(): SearchParams { return this.searchParamsSubject.getValue(); }

  public searchResults = new SearchResults();

  public searchFinished = new EventEmitter<ResultInfo>();

  private timeElapsedInfoSubject = new BehaviorSubject<TimeElapsedInfo>(null);
  public timeElapsedInfo$ = this.timeElapsedInfoSubject.asObservable();

  private startTime: Date;
  private timeElapsedTimer;

  private handler: PartSeqSearchHandler;
  private handlerSubscription = new Subscription();



  constructor(
    private backendService: BackendService,
  ) {
    // Default params
    this.searchParamsSubject.next({
      dateSpan: {
        fromDateIncl: getDatePart(addDays(new Date(), -30)),
        toDateIncl: getDatePart(new Date())
      },
      excludeDuplicates: true,
      scheme: null,
    });
  }


  public setSelectedScheme(scheme: SearchScheme) {
    const params = this.searchParamsSubject.getValue();

    if (params && params.scheme && params.scheme.id === scheme.id) {
      return;
    }

    // Reset the search results
    this.searchResults.reset();

    this.searchParamsSubject.next({
      ...this.searchParamsSubject.getValue(),
      scheme
    });
  }


  public setSearchParam(param: 'dateSpan' | 'excludeDuplicates', value: any) {
    const params = this.searchParamsSubject.getValue();
    this.searchParamsSubject.next({
      ...params,
      [param]: value
    });
  }


  public submitSearch(
    scheme: SearchScheme,
    dateSpan: DateSpan,
    excludeDuplicates: boolean,
    daysPerPart: number = DEFAULT_DAYS_PER_PART,
  ) {

    this.searchStateSubject.next(SearchState.searching);
    this.searchResults.reset();
    this.searchParamsSubject.next({ scheme, dateSpan, excludeDuplicates });

    // Setup time elapsed handler
    this.startTime = new Date();

    this.timeElapsedInfoSubject.next({
      startTime: null,
      timeElapsedSecs: 0,
      timeElapsedLabel: null,
    });

    this.timeElapsedTimer = setInterval(
      () => this.updateTimeElapsed(), 1000
    );

    // Create date spans for the parts
    const partDateSpans = this.getPartsDateSpans(dateSpan, daysPerPart);

    this.searchResults.init(
      scheme.kind,
      daysPerPart,
      partDateSpans.length
    );

    // Setup handler
    this.handlerSubscription.unsubscribe();
    this.handlerSubscription = new Subscription();

    this.handler = new PartSeqSearchHandler(
      scheme,
      partDateSpans,
      excludeDuplicates,
      this.backendService,
    );

    this.handlerSubscription.add(
      this.handler.partRetrieved.subscribe(
        (part: SearchResultsPart) => this.searchResults.addPart(
          part.dateSpan,
          part.itemIds,
          part.stats,
        )
      )
    );

    this.handlerSubscription.add(
      this.handler.searchFinished.subscribe(

        (result: ResultInfo) => {

          if (result.status === ResultStatus.success) { }
          if (result.status === ResultStatus.cancelled) { }
          if (result.status === ResultStatus.error) {
            this.searchResults.reset();
          }

          this.searchStateSubject.next(SearchState.idle);
          this.searchFinished.emit(result);

          // Stop time elapsed timer
          this.updateTimeElapsed();
          clearTimeout(this.timeElapsedTimer);
        }
      )
    );

    this.handler.execute();
  }


  public async cancelSearch() {

    this.searchStateSubject.next(SearchState.cancelling);

    if (this.handler) {
      await this.handler.cancel();
    }
  }


  private getPartsDateSpans(
    dateSpan: DateSpan,
    daysPerPart: number
  ): DateSpan[] {

    const result: DateSpan[] = [];

    // Copy the object and remove hours
    const fromDateIncl = new Date(dateSpan.fromDateIncl);
    fromDateIncl.setHours(0, 0, 0, 0);

    // Copy the object and remove hours
    const toDateIncl = new Date(dateSpan.toDateIncl);
    toDateIncl.setHours(0, 0, 0, 0);
    toDateIncl.setDate(toDateIncl.getDate());


    const dateDiffDays = getDateDiffDays(fromDateIncl, toDateIncl);
    const partsCount = Math.ceil((dateDiffDays + 1) / daysPerPart);


    for (let i = 0; i < partsCount; i++) {
      result.push({
        fromDateIncl: addDays(fromDateIncl, i * daysPerPart),
        toDateIncl: addDays(fromDateIncl, Math.min(
          (i + 1) * daysPerPart - 1,
          dateDiffDays
        ))
      });
    }

    return result;
  }


  private updateTimeElapsed() {
    const now = new Date();
    const timeElapsedSecs = (now.getTime() - this.startTime.getTime()) / 1000;

    this.timeElapsedInfoSubject.next({
      startTime: this.startTime,
      timeElapsedSecs,
      timeElapsedLabel: secondsToHMS(timeElapsedSecs),
    });
  }

}
