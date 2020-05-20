import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../services/utils/format-datepicker/format-datepicker';

import { ArticleFilteringScheme, DateSpan } from '../model';
import { getArticleFilteringSchemeString } from '../utils';
import { addDays, getDatePart } from '../../../services/utils/utils';

@Component({
  selector: 'app-filtering-scheme-preview',
  templateUrl: './filtering-scheme-preview.component.html',
  styleUrls: ['./filtering-scheme-preview.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class FilteringSchemePreviewComponent implements OnInit, OnChanges {


  public schemeString: string;
  public dateSpan: DateSpan;


  @Input() public scheme: ArticleFilteringScheme;

  @Output() public submit = new EventEmitter();
  @Output() public edit = new EventEmitter();
  @Output() public clear = new EventEmitter();
  @Output() public dateSpanChange = new EventEmitter<DateSpan>();


  constructor() {
  }


  ngOnInit() {
    this.updateSchemeString();

    this.dateSpan = {
      fromDateIncl: getDatePart(addDays(new Date(), -30)),
      toDateIncl: getDatePart(new Date())
    };

    this.onDateSpanChange();
  }


  ngOnChanges(changes: SimpleChanges) {
    this.updateSchemeString();
  }


  public onDateSpanChange() {
    this.dateSpan = {
      fromDateIncl: getDatePart(this.dateSpan.fromDateIncl),
      toDateIncl: getDatePart(this.dateSpan.toDateIncl),
    };
    this.dateSpanChange.emit(this.dateSpan);
  }


  public onSubmitClick() {
    this.submit.emit();
  }


  public onEditClick() {
    this.edit.emit();
  }


  public onClearClick() {
    this.clear.emit();
  }


  private updateSchemeString() {
    if (!this.scheme) {
      this.schemeString = null;
      return;
    }

    const str = getArticleFilteringSchemeString(this.scheme);
    this.schemeString = str.split('\n').join('<br>');
  }
}
