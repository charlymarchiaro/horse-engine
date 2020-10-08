import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { OnChanges } from '@angular/core';

@Component({
  selector: "mat-paginator-goto",
  templateUrl: './mat-paginator-goto.component.html',
  styleUrls: ['./mat-paginator-goto.component.scss']
})
export class MatPaginatorGotoComponent implements OnInit, OnChanges {
  pageSize: number;
  pageIndex: number;
  length: number;
  goTo: number;
  pageNumbers: number[];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @Input() disabled = false;
  @Input() hidePageSize = false;
  @Input() pageSizeOptions: number[];
  @Input() showFirstLastButtons = false;
  @Output() page = new EventEmitter<PageEvent>();
  @Input('pageIndex') set pageIndexChanged(pageIndex: number) {
    this.pageIndex = pageIndex;
  }
  @Input('length') set lengthChanged(length: number) {
    this.length = length;
    this.updateGoto();
  }
  @Input('pageSize') set pageSizeChanged(pageSize: number) {
    this.pageSize = pageSize;
    this.updateGoto();
  }

  constructor() { }

  ngOnInit() {
    this.updateGoto();
  }

  ngOnChanges() {
    this.updateGoto();
  }

  updateGoto() {
    this.goTo = (this.pageIndex || 0) + 1;
    this.pageNumbers = [];
    for (let i = 1; i <= Math.floor(this.length / this.pageSize) + 1; i++) {
      this.pageNumbers.push(i);
    }
  }

  paginationChange(pageEvt: PageEvent) {
    this.length = pageEvt.length;
    this.pageIndex = pageEvt.pageIndex;
    this.pageSize = pageEvt.pageSize;
    this.updateGoto();
    this.emitPageEvent(pageEvt);
  }

  goToChange() {
    this.paginator.pageIndex = this.goTo - 1;
    this.emitPageEvent({
      length: this.paginator.length,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    });
  }

  emitPageEvent(pageEvent: PageEvent) {
    this.page.next(pageEvent);
  }
}

/** Created by Sameer Khan **/
