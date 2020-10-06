import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { SearchScheme } from '../../../model/search-scheme.model';
import { DateSpan } from '../../keyword-search/model';
import { getDatePart, addDays } from '../../../services/utils/utils';
import { SearchService } from '../search.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../services/utils/format-datepicker/format-datepicker';
import { Subscription } from 'rxjs';
import { SearchState } from '../../../model/search.model';

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


  public searchState: SearchState;


  @Input() searchScheme: SearchScheme;
  @Output() public dateSpanChange = new EventEmitter<DateSpan>();


  searchProgress: number;
  articleIds: string[] = [];


  private subscription = new Subscription();


  constructor(
    private searchService: SearchService,
  ) {
    this.subscription.add(
      searchService.searchResults.part$.subscribe(
        p => console.log(p)
      )
    );
    this.subscription.add(
      searchService.searchResults.progressPercent$.subscribe(
        p => this.searchProgress = p
      )
    );
    this.subscription.add(
      searchService.searchFinished.subscribe(
        sf => console.log(sf)
      )
    );
    this.subscription.add(
      searchService.searchState$.subscribe(
        ss => this.searchState = ss
      )
    );
  }


  ngOnInit() {
    this.dateSpan = {
      fromDateIncl: getDatePart(addDays(new Date(), -30)),
      toDateIncl: getDatePart(new Date())
    };

    this.onDateSpanChange();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  ngOnChanges(changes: SimpleChanges) {
  }


  onSubmit() {

    this.articleIds = [];

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
