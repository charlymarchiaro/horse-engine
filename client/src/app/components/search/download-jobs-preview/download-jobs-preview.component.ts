import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResultsDownloaderService } from '../results-downloader/results-downloader.service';
import { Subscription } from 'rxjs';
import { DownloadJobHandler } from '../results-downloader/download-job-handler';
import { DatePipe } from '@angular/common';



interface JobData {
  schemeName: string;
  dateSpan: string;
  status: string;
  progressPercent: number;
  pid: string;
}


@Component({
  selector: 'app-search-download-jobs-preview',
  templateUrl: './download-jobs-preview.component.html',
  styleUrls: ['./download-jobs-preview.component.scss']
})
export class DownloadJobsPreviewComponent implements OnInit, OnDestroy {

  public downloadJobHandlers: DownloadJobHandler[] = [];

  public jobsData: { [pid: string]: JobData } = {};

  private pollTimer;
  private subscription = new Subscription();


  constructor(
    private downloader: ResultsDownloaderService,
    private datePipe: DatePipe,
  ) {
    this.subscription.add(
      downloader.handlers$.subscribe(
        h => this.downloadJobHandlers = h
      )
    );

    this.pollTimer = setInterval(() => this.updateJobsData(), 100);
  }


  ngOnInit() {
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    window.clearInterval(this.pollTimer);
  }


  onCancelClick(handlerPid) {
    this.downloader.cancelJob(handlerPid);
  }


  private updateJobsData() {

    this.jobsData = this.downloadJobHandlers.reduce((dict, handler) => {

      const schemeName = handler.params.searchParams.scheme.name;

      const dateSpan = handler.params.searchParams.dateSpan;
      const fromDate = this.datePipe.transform(dateSpan.fromDateIncl, 'dd-MMM-yyyy');
      const toDate = this.datePipe.transform(dateSpan.toDateIncl, 'dd-MMM-yyyy');
      const dateSpanLabel = `${fromDate} - ${toDate}`;

      const status = 'Downloading...';

      const progressPercent = handler.progressPercent;

      dict[handler.pid] = ({
        schemeName,
        dateSpan: dateSpanLabel,
        status,
        progressPercent,
        pid: handler.pid,
      });

      return dict;
    },
      {}
    );
  }
}
