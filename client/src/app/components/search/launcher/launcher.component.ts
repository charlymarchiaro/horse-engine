import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { SearchScheme } from '../../../model/search-scheme.model';
import { DateSpan } from '../../keyword-search/model';
import { getDatePart, addDays } from '../../../services/utils/utils';
import { SearchService } from '../search.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../services/utils/format-datepicker/format-datepicker';
import { Subscription } from 'rxjs';
import { SearchState, ResultInfo, ResultStatus, TimeElapsedInfo, SearchParams } from '../../../model/search.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-search-launcher',
  templateUrl: './launcher.component.html',
  styleUrls: ['./launcher.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class LauncherComponent implements OnInit, OnDestroy, OnChanges {

  public errorMessage: string;
  public isError: boolean;

  public dateSpan: DateSpan;

  public searchParams: SearchParams;
  public searchState: SearchState;
  public totalItemsCount: number;
  public timeElapsedInfo: TimeElapsedInfo;


  @Input() searchScheme: SearchScheme;
  @Output() public dateSpanChange = new EventEmitter<DateSpan>();


  searchProgress: number;
  articleIds: string[] = [];


  private subscription = new Subscription();


  constructor(
    private searchService: SearchService,
  ) {
    this.dateSpan = {
      fromDateIncl: getDatePart(addDays(new Date(), -30)),
      toDateIncl: getDatePart(new Date())
    };

    this.onDateSpanChange();


    this.subscription.add(
      searchService.searchParams$.pipe(filter(p => !!p)).subscribe(
        p => {
          this.dateSpan = p.dateSpan;
          this.onDateSpanChange();
        }
      )
    );
    this.subscription.add(
      searchService.searchResults.totalItemsCount$.subscribe(
        c => {
          this.totalItemsCount = c;
        }
      )
    );
    this.subscription.add(
      searchService.searchResults.progressPercent$.subscribe(
        p => this.searchProgress = p
      )
    );
    this.subscription.add(
      searchService.searchFinished.subscribe(

        (sf: ResultInfo) => {

          if (sf.status === ResultStatus.error) {
            this.isError = true;
            this.errorMessage = sf.message;
          } else {
            this.isError = false;
            this.errorMessage = null;
          }
        }
      )
    );
    this.subscription.add(
      searchService.searchState$.subscribe(
        ss => this.searchState = ss
      )
    );
    this.subscription.add(
      searchService.timeElapsedInfo$.subscribe(
        te => this.timeElapsedInfo = te
      )
    );
  }


  ngOnInit() {
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnChanges(changes: SimpleChanges) {
  }


  onSubmit() {

    this.articleIds = [];

    this.isError = false;
    this.errorMessage = null;

    this.searchService.submitSearch(this.searchScheme, this.dateSpan);
  }


  onCancel() {
    this.searchService.cancelSearch();
  }


  public onDateSpanChange() {
    this.dateSpan = {
      fromDateIncl: getDatePart(this.dateSpan.fromDateIncl),
      toDateIncl: getDatePart(this.dateSpan.toDateIncl),
    };
    this.dateSpanChange.emit(this.dateSpan);
  }

}
