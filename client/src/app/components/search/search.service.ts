import { Injectable, EventEmitter } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { DateSpan } from '../keyword-search/model';
import { SearchScheme } from '../../model/search-scheme.model';
import { SearchState, SearchResults, DEFAULT_DAYS_PER_PART, SearchResultsPart, ResultInfo, ResultStatus } from '../../model/search.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { getDateDiffDays, addDays } from '../../services/utils/utils';
import { PartSeqSearchHandler } from './part-seq-search-handler';




@Injectable({
  providedIn: 'root'
})
export class SearchService {


  private searchStateSubject = new BehaviorSubject<SearchState>(SearchState.idle);
  public searchState$ = this.searchStateSubject.asObservable();

  public searchResults = new SearchResults();

  public searchFinished = new EventEmitter<ResultInfo>();


  private handler: PartSeqSearchHandler;
  private handlerSubscription = new Subscription();



  constructor(
    private backendService: BackendService,
  ) { }


  public submitSearch(
    scheme: SearchScheme,
    dateSpan: DateSpan,
    daysPerPart: number = DEFAULT_DAYS_PER_PART
  ) {

    this.searchStateSubject.next(SearchState.searching);


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
      this.backendService,
    );

    this.handlerSubscription.add(
      this.handler.partRetrieved.subscribe(
        (part: SearchResultsPart) => this.searchResults.addPart(part.dateSpan, part.itemIds)
      )
    );

    this.handlerSubscription.add(
      this.handler.searchFinished.subscribe(

        (result: ResultInfo) => {

          if (result.status === ResultStatus.success) { }
          if (result.status === ResultStatus.cancelled) {
            this.searchResults.reset();
          }
          if (result.status === ResultStatus.error) {
            this.searchResults.reset();
          }

          this.searchStateSubject.next(SearchState.idle);
          this.searchFinished.emit(result);
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
}
