import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { Subscription, BehaviorSubject } from 'rxjs';
import { BackendService } from '../../../services/backend.service';
import { SearchService } from '../search.service';
import { arrayEquals } from '../../../services/utils/utils';
import { ResultsListService } from '../results-list/results-list.service';
import { LoadState, LoadStatus } from '../../../services/utils/load-status';
import { HighlightedArticle, SearchParams, SearchState } from '../../../model/search.model';
import { ResultsDownloaderService } from '../results-downloader/results-downloader.service';
import { filter } from 'rxjs/operators';


export interface ArticleSelectEventArgs {
  article: HighlightedArticle;
}


@Component({
  selector: 'app-search-results-list',
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.scss']
})
export class ResultsListComponent implements OnInit, OnDestroy {

  private loadStateSubject = new BehaviorSubject<LoadState>({
    status: LoadStatus.notLoaded,
    errorMessage: null
  });

  public LoadStatus = LoadStatus;

  public window = window;

  public pageIndex = 0;
  public pageSize = 10;
  public pageSizeOptions = [10, 20, 50, 100];

  private searchParams: SearchParams;
  public searchState: SearchState;

  public totalItemsCount: number;

  private currentPageItemsIds: string[] = [];

  public selectedArticleId: string;

  public currentPageArticles: HighlightedArticle[] = [];

  // public origTooltipLabel = '(&nbsp;&nbsp;): Original&#13;(d): Duplicate&#13;(?): Not yet analyzed';
  public origTooltipLabel = `
                            (  ): Original
                            (d): Duplicate
                            (?): Not yet analyzed
                            `;


  private subscription = new Subscription();
  private backendSubscription = new Subscription();

  @ViewChild('listRef', { static: false }) listRef: ElementRef;

  @Output() public select = new EventEmitter<ArticleSelectEventArgs>();
  @Output() public loadState = this.loadStateSubject.asObservable();


  constructor(
    private resultsListService: ResultsListService,
    private searchService: SearchService,
    private backendService: BackendService,
    private downloader: ResultsDownloaderService,
    private datePipe: DatePipe,
  ) {
    this.subscription.add(
      searchService.searchParams$.pipe(
        filter(p => !!p && !!p.scheme)
      ).subscribe(
        p => {
          this.searchParams = p;
        }
      )
    );
    this.subscription.add(
      searchService.searchState$.subscribe(
        ss => {
          this.searchState = ss;
          if (ss === SearchState.searching) {
            this.setSelectedArticle(null);
            this.pageIndex = 0;
            this.refreshPageItems();
          }
        }
      )
    );
    this.subscription.add(
      searchService.searchResults.totalItemsCount$.subscribe(
        c => {
          this.totalItemsCount = c;
          this.refreshPageItems();
        }
      )
    );
    this.subscription.add(
      resultsListService.itemsPerPage$.subscribe(
        n => {
          this.pageSize = n;
          this.refreshPageItems();
        }
      )
    );
  }


  ngOnInit() {
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.backendSubscription.unsubscribe();
  }


  public onPageEvent(event: PageEvent) {
    try {
      if (event.pageSize !== this.pageSize) {

        // Adjust page index to show the first item of the previous page
        this.pageIndex = Math.floor(this.pageIndex * this.pageSize / event.pageSize);

        // Page size changed
        this.resultsListService.setItemsPerPage(event.pageSize);
      } else {
        // Page index changed
        this.pageIndex = event.pageIndex;
      }

      if (this.listRef) {
        this.listRef.nativeElement.scrollTop = 0;
      }

      this.refreshPageItems();

    } catch (e) {
      console.error(e);
    }
  }


  public onArticleSelect(article: HighlightedArticle) {
    this.setSelectedArticle(article);
  }


  private refreshPageItems() {

    const pageItemsIds = this.searchService.searchResults.getPaginatedItemIds(
      this.pageSize,
      this.pageIndex
    );

    // No changes, return
    if (arrayEquals(pageItemsIds, this.currentPageItemsIds)) {
      return;
    }

    this.currentPageItemsIds = pageItemsIds;

    this.loadStateSubject.next({ status: LoadStatus.loading, errorMessage: null });

    this.backendSubscription.unsubscribe();
    this.backendSubscription = this.backendService.getArticles(pageItemsIds).subscribe(

      response => {
        this.currentPageArticles = response.map(
          a => new HighlightedArticle(a, this.searchParams.scheme.scheme)
        );
        this.loadStateSubject.next({
          status: LoadStatus.loaded,
          errorMessage: null
        });
      },

      error => {
        this.loadStateSubject.next({
          status: LoadStatus.error,
          errorMessage: error.message.substr(0, 200)
        });
      }
    );
  }


  private setSelectedArticle(article: HighlightedArticle) {
    this.selectedArticleId = (!article || !article.article)
      ? null
      : article.article.id;

    this.select.emit({ article });
  }


  public onExportToExcelButtonClick() {
    this.downloader.scheduleDownload({
      itemIds: this.searchService.searchResults.itemIds,
      searchParams: this.searchParams
    });
  }
}
