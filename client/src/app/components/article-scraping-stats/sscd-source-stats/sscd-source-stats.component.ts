import { Component, OnInit, ViewChild } from '@angular/core';
import { MainService } from '../main.service';
import { LoadState, LoadStatus } from '../../../services/utils/load-status';
import { SscdDataRow } from '../model';
import { DatatableComponent } from '@swimlane/ngx-datatable';


@Component({
  selector: 'app-article-sscd-source-stats',
  templateUrl: './sscd-source-stats.component.html',
  styleUrls: ['./sscd-source-stats.component.scss']
})
export class SscdSourceStatsComponent implements OnInit {
  public loadState: LoadState;
  public LoadStatus = LoadStatus;

  public selected = [];
  public columns: { [field: string]: any }[];
  public rows: { [field: string]: any }[];
  public visibleRows: { [field: string]: any }[];
  public sorts: { [field: string]: any }[];

  public searchKeyword: string;


  @ViewChild(DatatableComponent, { static: true }) table: DatatableComponent;


  constructor(
    private mainService: MainService,
  ) {
    this.mainService.loadState$.subscribe(ls => this.loadState = ls);
    this.mainService.sourceSscdData$.subscribe(s => this.onStatsChange(s));
  }


  ngOnInit() {
    this.columns = [
      { prop: 'sourceName' },
      { prop: 'valH' },
      { prop: 'val1w' },
      { prop: 'valTrend' },
      { prop: 'dli', dir: 'desc' },
    ];

    // Sort by degradation level by default
    this.sorts = [
      { prop: 'dli', dir: 'asc' },
    ];
  }


  onRefresh() {
    this.mainService.requestData();
  }


  private onStatsChange(stats: SscdDataRow[]) {

    this.rows = stats;

    if (!stats) {
      return;
    }

    // Show a copy of the entire array
    this.visibleRows = [...this.rows];

    this.searchKeyword = null;
  }


  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // Filter our data
    const temp = this.rows.filter(function (d) {
      // Change the column name here
      // example d.places
      return d.sourceName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // Update the visible rows
    this.visibleRows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
}
