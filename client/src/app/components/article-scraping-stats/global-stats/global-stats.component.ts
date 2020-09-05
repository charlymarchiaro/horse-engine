import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MainService } from '../main.service';
import { LoadState, LoadStatus } from '../../../services/utils/load-status';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { GlobalDataRow } from '../model';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-article-global-stats',
  templateUrl: './global-stats.component.html',
  styleUrls: ['./global-stats.component.scss']
})
export class GlobalStatsComponent implements OnInit, OnDestroy {

  public loadState: LoadState;
  public LoadStatus = LoadStatus;

  public selected = [];
  public rowsPsr: { [field: string]: any }[];
  public rowsSscd: { [field: string]: any }[];
  public rowsPsdd: { [field: string]: any }[];

  private subscription = new Subscription();


  @ViewChild(DatatableComponent, { static: true }) table: DatatableComponent;


  constructor(
    private mainService: MainService,
  ) {
    this.subscription.add(
      this.mainService.loadState$.subscribe(ls => this.loadState = ls)
    );
    this.subscription.add(
      this.mainService.globalData$.subscribe(s => this.onStatsChange(s))
    );
  }


  ngOnInit() {
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  onRefresh() {
    this.mainService.requestData();
  }


  private onStatsChange(stats: GlobalDataRow) {
    if (!stats) {
      return;
    }

    // PSR
    this.rowsPsr = [
      {
        field: 'H %',
        value: stats.psr.valH,
        fieldType: 'val',
        devLvl: stats.psr.devLvlH,
      },
      {
        field: '1W %',
        value: stats.psr.val1w,
        fieldType: 'val',
        devLvl: stats.psr.devLvl1w,
      },
      {
        field: 'Trend %',
        value: stats.psr.valTrend,
        fieldType: 'trend',
        trendSign: stats.psr.trendSign,
      },
    ];

    // SSCD
    this.rowsSscd = [
      {
        field: 'H',
        value: stats.sscd.valH,
        fieldType: 'val',
        devLvl: stats.sscd.devLvlH,
      },
      {
        field: '1W',
        value: stats.sscd.val1w,
        fieldType: 'val',
        devLvl: stats.sscd.devLvl1w,
      },
      {
        field: 'Trend %',
        value: stats.sscd.valTrend,
        fieldType: 'trend',
        trendSign: stats.sscd.trendSign,
      },
    ];

    // PSDD
    this.rowsPsdd = [
      {
        field: 'H %',
        fieldType: 'val',
        // C1
        valueC1: stats.psdd.valHC1,
        devLvlC1: stats.psdd.devLvlHC1,
        // C2
        valueC2: stats.psdd.valHC2,
        devLvlC2: stats.psdd.devLvlHC2,
        // C3
        valueC3: stats.psdd.valHC3,
        devLvlC3: stats.psdd.devLvlHC3,
      },
      {
        field: '1W %',
        fieldType: 'val',
        // C1
        valueC1: stats.psdd.val1wC1,
        devLvlC1: stats.psdd.devLvl1wC1,
        // C2
        valueC2: stats.psdd.val1wC2,
        devLvlC2: stats.psdd.devLvl1wC2,
        // C3
        valueC3: stats.psdd.val1wC3,
        devLvlC3: stats.psdd.devLvl1wC3,
      },
      {
        field: 'Trend %',
        fieldType: 'trend',
        // C1
        valueC1: stats.psdd.valTrendC1,
        trendSignC1: stats.psdd.trendSignC1,
        // C2
        valueC2: stats.psdd.valTrendC2,
        trendSignC2: stats.psdd.trendSignC2,
        // C3
        valueC3: stats.psdd.valTrendC3,
        trendSignC3: stats.psdd.trendSignC3,
      },
    ];
  }
}
