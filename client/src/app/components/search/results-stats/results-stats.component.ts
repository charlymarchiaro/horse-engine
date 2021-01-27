import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chart } from 'angular-highcharts';
import { Params, DropdownItem, SeriesAggr, TimeAggr, TIME_AGGR_CHOICES, SERIES_AGGR_CHOICES, ResultsStatsService, ChartData, CHART_COLORS, Summary } from './results-stats.service';
import { SeriesOptionsType } from 'highcharts';




@Component({
  selector: 'app-results-stats',
  templateUrl: './results-stats.component.html',
  styleUrls: ['./results-stats.component.scss']
})
export class ResultsStatsComponent implements OnInit, OnDestroy {

  public params: Params;

  public chart: Chart;

  public summary: Summary;

  public seriesAggrChoices = SERIES_AGGR_CHOICES;
  public selectedSeriesAggr: DropdownItem<SeriesAggr>;

  public timeAggrChoices = TIME_AGGR_CHOICES;
  public selectedTimeAggr: DropdownItem<TimeAggr>;

  public canGenerateReport: boolean;


  private subscription = new Subscription();


  constructor(
    private resultsStatsService: ResultsStatsService,
  ) {
    this.subscription.add(
      resultsStatsService.params$.subscribe(
        s => this.onParamsChange(s)
      )
    );
    this.subscription.add(
      resultsStatsService.chartData$.subscribe(
        d => this.onChartDataChange(d)
      )
    );
    this.subscription.add(
      resultsStatsService.summary$.subscribe(
        s => this.summary = s
      )
    );
    this.subscription.add(
      resultsStatsService.canGenerateReport$.subscribe(
        cg => this.canGenerateReport = cg
      )
    );
  }


  ngOnInit() {
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  private onParamsChange(params: Params) {
    this.params = params;
    this.selectedSeriesAggr = params.selectedSeriesAggr;
    this.selectedTimeAggr = params.selectedTimeAggr;
  }


  public onSeriesAggrSelect(item: DropdownItem<SeriesAggr>) {
    this.resultsStatsService.setParams({
      ...this.params,
      selectedSeriesAggr: item
    });
  }


  public onTimeAggrSelect(item: DropdownItem<TimeAggr>) {
    this.resultsStatsService.setParams({
      ...this.params,
      selectedTimeAggr: item
    });
  }


  public onReportParamChange() {
    this.resultsStatsService.setParams(this.params);
  }


  public onExportToExcelButtonClick() {
    this.resultsStatsService.generateReport();
  }


  private onChartDataChange(data: ChartData) {
    this.chart = new Chart({
      chart: {
        type: 'line',
        animation: false,
        styledMode: false,
      },
      colors: CHART_COLORS,
      plotOptions: {
        series: {
          animation: false,
        },
      },
      title: {
        text: 'Search Results Stats'
      },
      legend: {
        maxHeight: 100,
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: data ? data.categories : []
      },
      series: data && data.series.length > 0
        ? data.series.map<SeriesOptionsType>(s => ({
          type: 'line',
          name: s.label,
          data: s.data,
          colorIndex: s.colorIndex,
          dashStyle: s.dashStyle,
        }))
        : [
          { type: 'line', name: 'Results', dashStyle: 'Solid' },
          { type: 'line', name: 'Title mentions', dashStyle: 'Dash' },
        ]
    });
  }
}
