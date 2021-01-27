import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchService } from '../search.service';
import { ArticleBooleanQueryResultsStats as ResultsStats, getDateSpanDates, SearchParams, SearchResultsPart } from 'app/model/search.model';
import { addDays, getISOStringDatePart, getYYYYMMDD } from 'app/services/utils/utils';
import { DashStyleValue, numberFormat, seriesType } from 'highcharts';
import { BackendService } from 'app/services/backend.service';
import { ArticleSource } from 'app/model/article.model';
import { DateTime } from 'luxon';
import pSBC from 'shade-blend-color';
import { SearchState } from '../../../model/search.model';
import { ExcelExportService, SheetData } from '../../../services/utils/excel-export.service';



export type SeriesAggr = 'total' | 'perSource';
export type TimeAggr = 'day' | 'week' | 'month';

export interface DropdownItem<T> {
  label: string;
  value: T;
}

export const SERIES_AGGR_CHOICES: DropdownItem<SeriesAggr>[] = [
  { label: 'Total', value: 'total' },
  { label: 'Per source', value: 'perSource' },
];

export const TIME_AGGR_CHOICES: DropdownItem<TimeAggr>[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export interface ReportOptions {
  seriesAggrTotal: boolean;
  seriesAggrPerSource: boolean;
  timeAggrDay: boolean;
  timeAggrWeek: boolean;
  timeAggrMonth: boolean;
}

export interface Params {
  selectedSeriesAggr: DropdownItem<SeriesAggr>;
  selectedTimeAggr: DropdownItem<TimeAggr>;
  reportOptions: ReportOptions;
}


export interface ChartSeriesData {
  label: string;
  data: number[];
  colorIndex: number;
  dashStyle: DashStyleValue;
}


export interface ChartData {
  categories: string[];
  series: ChartSeriesData[];
}


export interface Summary {
  resultsCount: number;
  titleMentionsCount: number;
}


interface TimeSampleDict {
  [seriesBaseId: string]: {
    matches: number;
    titleMatches: number;
  };
}

interface DataDict { [timeSampleId: string]: TimeSampleDict; }


const COLOR_PALETTE = [
  '#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
  '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1',
  '#2f7ed8', '#0d233a', '#8bbc21', '#910000', '#1aadce',
  '#492970', '#f28f43', '#77a1e5', '#c42525', '#a6c96a',
  '#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
  '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92',
];

export const CHART_COLORS = [
  ...COLOR_PALETTE,
  ...COLOR_PALETTE.map(c => pSBC(-0.4, c)),
  ...COLOR_PALETTE.map(c => pSBC(+0.4, c)),
];



@Injectable({
  providedIn: 'root'
})
export class ResultsStatsService {

  private searchState: SearchState;

  private paramsSubject = new BehaviorSubject<Params>({
    selectedSeriesAggr: SERIES_AGGR_CHOICES[0],
    selectedTimeAggr: TIME_AGGR_CHOICES[0],
    reportOptions: {
      seriesAggrTotal: true,
      seriesAggrPerSource: false,
      timeAggrDay: false,
      timeAggrWeek: false,
      timeAggrMonth: false,
    }
  });
  public params$ = this.paramsSubject.asObservable();

  private chartDataSubject = new BehaviorSubject<ChartData>(null);
  public chartData$ = this.chartDataSubject.asObservable();

  private summarySubject = new BehaviorSubject<Summary>({
    resultsCount: 0,
    titleMentionsCount: 0,
  });
  public summary$ = this.summarySubject.asObservable();

  private canGenerateReportSubject = new BehaviorSubject<boolean>(false);
  public canGenerateReport$ = this.canGenerateReportSubject.asObservable();

  private chartDates: Date[] = [];
  private statsDict: { [date: string]: ResultsStats.DailyStats };
  private articleSourcesDict: { [sourceId: string]: { index: number; articleSource: ArticleSource; } };


  private newTimeSampleDict = (seriesBaseIds: string[]) =>
    seriesBaseIds.reduce(
      (d, i) => { d[i] = { matches: 0, titleMatches: 0 }; return d; },
      {} as TimeSampleDict
    )

  private newDataDict = (timeSampleIds: string[], seriesBaseIds: string[]) =>
    timeSampleIds.reduce(
      (d, i) => { d[i] = this.newTimeSampleDict(seriesBaseIds); return d; },
      {} as DataDict
    )


  constructor(
    private searchService: SearchService,
    private backendService: BackendService,
    private excelExportService: ExcelExportService,
  ) {
    this.init();
  }


  private async init() {
    const articleSources = await this.backendService.getArticleSources().toPromise();

    this.articleSourcesDict = articleSources.reduce(
      (dict, item, i) => {
        dict[item.id] = {
          index: i,
          articleSource: item,
        };
        return dict;
      }, {} as {
        [articleSourceId: string]: { index: number; articleSource: ArticleSource; }
      }
    );

    this.searchService.searchState$.subscribe(
      ss => {
        this.searchState = ss;
        this.updateCanGenerateReport();
      }
    );

    this.searchService.searchResults.newPart$
      .subscribe(
        p => {
          this.statsDict = this.searchService.searchResults.stats.dates
            .reduce((dict, ds) => {
              dict[ds.date] = ds;
              return dict;
            }, {} as { [date: string]: ResultsStats.DailyStats });

          // The chart date span starts on the search
          // start and ends on the current part end
          this.chartDates = p
            ? getDateSpanDates({
              fromDateIncl: addDays(this.searchService.searchParams.dateSpan.fromDateIncl, -1),
              toDateIncl: addDays(p.dateSpan.toDateIncl, 1),
            })
            : [];

          // Summary
          const dailyTotals = Object.values(this.statsDict).map(ds => ds.total);

          const resultsCount = dailyTotals.reduce(
            (c, d) => c + d.matchCount, 0
          );
          const titleMentionsCount = dailyTotals.reduce(
            (c, d) => c + d.titleMatchCount, 0
          );

          this.summarySubject.next({
            resultsCount,
            titleMentionsCount,
          });

          // Chart data
          this.updateChartData();
        }
      );

    this.searchService.searchParams$.subscribe(
      p => this.onSearchParamsChange(p)
    );
  }


  public setParams(params: Params) {

    const prevParams = this.paramsSubject.getValue();
    this.paramsSubject.next(params);

    if (
      prevParams.selectedSeriesAggr !== params.selectedSeriesAggr
      || prevParams.selectedTimeAggr !== params.selectedTimeAggr
    ) {
      this.updateChartData();
    }

    this.updateCanGenerateReport();
  }


  public generateReport() {
    if (!this.canGenerateReportSubject.getValue()) {
      return;
    }
    this.doGenerateReport();
  }


  private onSearchParamsChange(params: SearchParams) {
    this.updateChartData();
  }


  private updateChartData() {

    const params = this.paramsSubject.getValue();

    this.chartDataSubject.next(
      this.generateChartData(
        params.selectedSeriesAggr.value,
        params.selectedTimeAggr.value,
      )
    );

    this.updateCanGenerateReport();
  }


  private generateChartData(seriesAggr: SeriesAggr, timeAggr: TimeAggr): ChartData {
    const isTotalAggr = seriesAggr === 'total';

    const seriesBaseIds = isTotalAggr ? ['Total'] : this.getSeriesSourceIds();
    const timeSampleIds = this.getTimeSampleIds(timeAggr);

    const dataDict = this.newDataDict(timeSampleIds, seriesBaseIds);

    // Iterate dates
    for (const ds of Object.values(this.statsDict)) {
      const timeSampleId = this.mapDateToTimeSampleId(new Date(ds.date), timeAggr);

      if (isTotalAggr) {
        // Total aggregation
        try {
          dataDict[timeSampleId]['Total'].matches += ds.total.matchCount;
          dataDict[timeSampleId]['Total'].titleMatches += ds.total.titleMatchCount;
        } catch (e) {
          console.error('Time sample is outside of the chart range: ' + timeSampleId);
        }

      } else {
        // Source aggregation
        for (const source of ds.articleSources) {
          try {
            dataDict[timeSampleId][source.articleSourceId].matches += source.matchCount;
            dataDict[timeSampleId][source.articleSourceId].titleMatches += source.titleMatchCount;
          } catch (e) {
            console.error('Time sample is outside of the chart range: ' + timeSampleId);
          }
        }
      }
    }

    const series: ChartSeriesData[] = [];

    seriesBaseIds.forEach(seriesBaseId => {
      const [seriesBaseName, colorIndex] = seriesAggr === 'perSource'
        ? [
          this.articleSourcesDict[seriesBaseId].articleSource.name,
          this.articleSourcesDict[seriesBaseId].index % CHART_COLORS.length,
        ]
        : ['Total', 0];

      const matchesData = Object.values(dataDict).map(d => d[seriesBaseId].matches);
      const titleMatchesData = Object.values(dataDict).map(d => d[seriesBaseId].titleMatches);

      series.push({
        label: seriesBaseName + ' - Results',
        data: matchesData,
        dashStyle: 'Solid',
        colorIndex,
      });
      series.push({
        label: seriesBaseName + ' - Title mentions',
        data: titleMatchesData,
        dashStyle: 'Dash',
        colorIndex,
      });
    });

    return {
      categories: timeSampleIds,
      series
    };
  }

  private getSeriesSourceIds(): string[] {

    const sourceIdsDict: { [id: string]: any } = {};

    for (const ds of Object.values(this.statsDict)) {
      for (const sourceId of ds.articleSources.map(as => as.articleSourceId)) {
        sourceIdsDict[sourceId] = null;
      }
    }
    return Object.keys(sourceIdsDict);
  }


  private getTimeSampleIds(timeAggr: TimeAggr): string[] {

    const timeSampleIdsDict: { [id: string]: any } = {};

    for (const date of this.chartDates) {
      const timeSampleId = this.mapDateToTimeSampleId(date, timeAggr);
      timeSampleIdsDict[timeSampleId] = null;
    }
    return Object.keys(timeSampleIdsDict);
  }


  private mapDateToTimeSampleId(date: Date, timeAggr: TimeAggr): string {

    // Day
    if (timeAggr === 'day') {
      return getISOStringDatePart(date);
    }

    // Week
    if (timeAggr === 'week') {
      const isoWeekDate = DateTime.fromJSDate(date).toISOWeekDate();
      const parts = isoWeekDate.split('-');
      return `${parts[0]}-${parts[1]}`;
    }

    // Month
    if (timeAggr === 'month') {
      const year = DateTime.fromJSDate(date).year;
      const month = DateTime.fromJSDate(date).monthShort;
      return `${month} ${year}`;
    }
  }


  private updateCanGenerateReport() {
    const canGenerate = (): boolean => {
      if (this.searchState !== SearchState.idle) {
        return false;
      }
      if (!this.statsDict || Object.keys(this.statsDict).length === 0) {
        return false;
      }

      const reportOptions = this.paramsSubject.getValue().reportOptions;
      if (![
        reportOptions.timeAggrDay,
        reportOptions.timeAggrWeek,
        reportOptions.timeAggrMonth,
      ].includes(true)) {
        return false;
      }

      return true;
    };

    this.canGenerateReportSubject.next(canGenerate());
  }


  /**
   * Generate Excel report
   */
  private doGenerateReport() {

    const reportOptions = this.paramsSubject.getValue().reportOptions;

    const seriesAggrList: SeriesAggr[] = [];
    const timeAggrList: TimeAggr[] = [];

    if (reportOptions.seriesAggrTotal) { seriesAggrList.push('total'); }
    if (reportOptions.seriesAggrPerSource) { seriesAggrList.push('perSource'); }
    if (reportOptions.timeAggrDay) { timeAggrList.push('day'); }
    if (reportOptions.timeAggrWeek) { timeAggrList.push('week'); }
    if (reportOptions.timeAggrMonth) { timeAggrList.push('month'); }


    const data: SheetData[] = [];

    for (const seriesAggr of seriesAggrList) {
      for (const timeAggr of timeAggrList) {

        const chartData = this.generateChartData(seriesAggr, timeAggr);

        console.log(chartData)
      }
    }
  }
}
