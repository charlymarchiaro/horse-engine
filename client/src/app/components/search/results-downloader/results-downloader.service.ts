import { Injectable } from '@angular/core';
import { DownloadJobHandler, ResultInfo, ResultStatus } from './download-job-handler';
import { SearchParams } from '../../../model/search.model';
import { BackendService } from '../../../services/backend.service';

import { DatePipe } from '@angular/common';
import { ExcelExportService } from '../../../services/utils/excel-export.service';
import { BehaviorSubject } from 'rxjs';
import { CommonDialogsService } from '../../../services/utils/common-dialogs/common-dialogs.service';


export interface DownloadRequestParams {
  itemIds: string[];
  searchParams: SearchParams;
}


@Injectable({
  providedIn: 'root'
})
export class ResultsDownloaderService {


  private handlersSubject = new BehaviorSubject<DownloadJobHandler[]>([]);
  public handlers$ = this.handlersSubject.asObservable();


  constructor(
    private backendService: BackendService,
    private excelExportService: ExcelExportService,
    private commonDialogs: CommonDialogsService,
    private datePipe: DatePipe,
  ) { }


  public scheduleDownload(params: DownloadRequestParams) {
    const handler = new DownloadJobHandler(
      params,
      this.backendService,
      this.excelExportService,
      this.datePipe,
    );

    this.handlersSubject.next([
      ...this.handlersSubject.getValue(),
      handler,
    ]);

    handler.jobFinished.subscribe(
      r => this.onJobFinished(r)
    );

    handler.start();
  }


  public cancelJob(pid: string) {
    const handler = this.handlersSubject.getValue().find(
      h => h.pid === pid
    );

    if (!handler) {
      return;
    }

    handler.cancel();
  }


  private onJobFinished(result: ResultInfo) {
    this.handlersSubject.next(
      this.handlersSubject.getValue()
        .filter(h => h.pid !== result.pid)
    );

    if (result.status === ResultStatus.error) {
      console.error(result.message);

      this.commonDialogs.showNotificationDialog(
        'error',
        'Error de exportación',
        'Search results export',
        'Se produjo un error al exportar los datos.'
      );
    }
  }
}
