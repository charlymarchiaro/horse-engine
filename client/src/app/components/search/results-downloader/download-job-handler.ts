import { DownloadRequestParams } from './results-downloader.service';
import { generatePidTag, convertDateToUtc, getISOStringDatePart, convertDateToDdMmYyyy } from '../../../services/utils/utils';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { BackendService } from '../../../services/backend.service';
import { Article } from '../../../model/article.model';
import { ExcelExportService, ColConfig } from '../../../services/utils/excel-export.service';
import { DatePipe } from '@angular/common';


const ITEMS_PER_PART = 100;
const NUMBER_OF_TRIES = 3;


export enum JobState {
  idle = 'idle',
  downloading = 'downloading',
  exporting = 'exporting',
}

export enum ResultStatus {
  success = 'success',
  error = 'error',
  cancelled = 'cancelled',
}

export interface ResultInfo {
  status: ResultStatus;
  message?: string;
  pid: string;
}


export class DownloadJobHandler {

  public readonly pid = generatePidTag();

  private isCancelled: boolean;

  private jobStateSubject = new BehaviorSubject<JobState>(JobState.idle);
  public jobState$ = this.jobStateSubject.asObservable();
  get jobState() { return this.jobResultSubject.getValue(); }

  private jobResultSubject = new BehaviorSubject<ResultInfo>(null);
  public jobResult$ = this.jobResultSubject.asObservable();
  public jobFinished = new EventEmitter<ResultInfo>();

  private _progressPercent = 0;
  get progressPercent() { return this._progressPercent; }

  get params() { return this._params; }


  constructor(
    private _params: DownloadRequestParams,
    private backendService: BackendService,
    private excelExport: ExcelExportService,
    private datePipe: DatePipe,
  ) { }


  public async start() {
    this.jobStateSubject.next(JobState.downloading);

    const numberOfParts = Math.ceil(this._params.itemIds.length / ITEMS_PER_PART);

    const articles: Article[] = [];


    for (let partIndex = 0; partIndex < numberOfParts; partIndex++) {

      this._progressPercent = 100.0 * partIndex / (numberOfParts - 1);

      const ids = this._params.itemIds.slice(
        partIndex * ITEMS_PER_PART,
        (partIndex + 1) * ITEMS_PER_PART
      );

      for (let tryIndex = 0; tryIndex < NUMBER_OF_TRIES; tryIndex++) {

        // Try loop
        try {

          // Has been cancelled --> stop execution
          if (this.isCancelled) {
            this.emitUserCancellationEvent();
            return;
          }

          const result = await this.backendService.getArticles(ids).toPromise();
          articles.push(...result);

          // Success --> download next part
          break;

        } catch (e) {

          console.error(e);

          // Job is cancelled --> ignore.
          if (this.isCancelled) {
            this.emitUserCancellationEvent();
            return;
          }

          if (tryIndex === NUMBER_OF_TRIES - 1) {
            // Max retries reached --> Abort job (error)
            console.error(`Download job failed ${NUMBER_OF_TRIES} times, pid: ${this.pid} --> aborting.`);
            this.emitErrorEvent(e.message);
            return;

          } else {
            // Download failed --> retry
            console.warn(`Download job failed, pid: ${this.pid} --> retrying.`);
          }
        }
      }
    }

    this.exportToExcel(articles);
    this.emitSuccessEvent();
  }


  public cancel() {
    console.log('Download job cancelled by user, pid: ' + this.pid);
    this.isCancelled = true;
  }


  private exportToExcel(articles: Article[]) {
    if (!articles || articles.length === 0) {
      return;
    }

    const fileName = this._params.searchParams.scheme.name
      + ' - '
      + this.datePipe.transform(Date.now(), 'dd-MM-yyyy')
      + '.xlsx';

    const startDate = this.datePipe.transform(
      this._params.searchParams.dateSpan.fromDateIncl,
      'dd/MM/yyyy'
    );

    const endDate = this.datePipe.transform(
      this._params.searchParams.dateSpan.toDateIncl,
      'dd/MM/yyyy'
    );

    const period = `Desde: ${startDate} - Hasta: ${endDate}`;
    const titleMatchKeywords = this._params.searchParams.scheme.scheme.titleMatchKeywords;

    const titleMatch = (title: string, values: string[]): boolean => {
      return values.filter(v => title.includes(v)).length > 0;
    };

    const data = [
      [
        'País',
        'Medio',
        'Tier',
        'Territorio',
        'Círculo Rojo',
        'Fecha',
        'Mención título',
        'Título',
        'Nota Completa',
        'Link',
        'Reach',
        'Ad Value - 5',
        'Ad Value - 1,5',
      ],
      ...articles.map(a => [
        a.articleSource.country,
        a.articleSource.name,
        a.articleSource.tier,
        a.articleSource.region,
        a.articleSource.redCircle ? 'SI' : 'NO',
        convertDateToDdMmYyyy(a.date),
        titleMatch(a.title || '', titleMatchKeywords) ? 'SI' : 'NO',
        a.title,
        // Excel characters limit
        a.text.substr(0, 32767),
        a.articleSource.url.split(':')[0] + '://' + a.url,
        a.articleSource.reach,
        a.articleSource.adValue500,
        a.articleSource.adValue150,
      ])
    ];

    const colsConfig: ColConfig[] = [
      { colInfo: { width: 20 } }, // País
      { colInfo: { width: 12 } }, // Medio
      { colInfo: { width: 8 } }, // Tier
      { colInfo: { width: 15 } }, // Territorio
      { colInfo: { width: 15 } }, // Círculo rojo
      { colInfo: { width: 20 } }, // Fecha
      { colInfo: { width: 15 } }, // Mención título
      { colInfo: { width: 64 }, textWrap: true }, // Título
      { colInfo: { width: 64 }, textWrap: true }, // Nota Completa
      { colInfo: { width: 64 }, textWrap: true, hyperlink: true }, // Link
      { colInfo: { width: 15 } }, // Reach
      { colInfo: { width: 15 } }, // Ad Value - 5
      { colInfo: { width: 15 } }, // Ad Value - 1,5
    ];

    const titleMatchKeywordsStr = titleMatchKeywords.join(', ');

    this.excelExport.export({
      moduleLabel: 'Search results export',
      fileName,
      sheets: [{
        name: 'Results',
        headerData: {
          'Esquema de búsqueda:': this._params.searchParams.scheme.name,
          'Palabras clave:': titleMatchKeywordsStr,
          'Período:': period,
          'Universo:': ''
        },
        colsConfig,
        bodyData: data,
        settings: {
          enableFilter: true,
        }
      }],
    });
  }


  private emitSuccessEvent() {
    this.jobFinished.emit({
      status: ResultStatus.success,
      pid: this.pid,
    });
  }

  private emitErrorEvent(message: string) {
    this.jobFinished.emit({
      status: ResultStatus.error,
      message,
      pid: this.pid,
    });
  }

  private emitUserCancellationEvent() {
    this.jobFinished.emit({
      status: ResultStatus.cancelled,
      message: 'Cancelled by user',
      pid: this.pid,
    });
  }
}


