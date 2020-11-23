import { Component, OnInit, OnDestroy } from '@angular/core';

import { JobsListInfo } from '../../model/scrapyd.model';
import { BackendService } from '../../services/backend.service';
import { Article, ArticleSummary } from '../../model/article.model';



export const NUMBER_OF_DISPLAYED_ARTICLES = 10;


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private jobsPollingTimer;
  private lastScrapedArticlesInfoTimer;

  public jobsListInfo: JobsListInfo;
  public lastScrapedArticlesInfo: ArticleSummary[] = [];


  public scheduleKeyword = '';
  public cancelKeyword = '';


  constructor(
    private backendService: BackendService,
  ) { }


  ngOnInit() {
    this.jobsPollingTimer = setInterval(
      () => this.updateJobsInfo(),
      5000
    );

    this.lastScrapedArticlesInfoTimer = setInterval(
      () => this.updateLastScrapedArticlesInfo(),
      5000
    );

    this.updateJobsInfo();
    this.updateLastScrapedArticlesInfo();
  }


  ngOnDestroy() {
    clearInterval(this.jobsPollingTimer);
    clearInterval(this.lastScrapedArticlesInfoTimer);
  }


  public onListAllSpidersClick() {
    this.listAllSpiders();
  }


  public onScheduleAllSpidersClick() {
    this.scheduleAllSpiders();
  }


  public onScheduleByKeywordClick() {
    this.scheduleSpidersByKeword(this.scheduleKeyword);
  }


  public onListJobsClick() {
    this.listJobs();
  }


  public onCancelAllJobsClick() {
    this.cancelAllJobs();
  }


  public onCancelByKeywordClick() {
    this.cancelSpidersByKeword(this.cancelKeyword);
  }


  private listAllSpiders() {
    this.backendService.listAllSpidersDetail().subscribe(
      response => console.log(response.sort(
        (a, b) => a.name > b.name ? 1 : -1
      ))
    );
  }


  private scheduleAllSpiders() {
    this.backendService.scheduleAllSpiders().subscribe(
      r => console.log(r)
    );
  }


  private async scheduleSpidersByKeword(keyword: string) {
    keyword = keyword.toLowerCase();

    const params = keyword.split(':');
    if (params.length !== 2) {
      return;
    }

    const nodeIdKeyword = params[0];
    const spiderNameKeyword = params[1];

    const nodes = (await this.backendService.listAllScrapydNodes().toPromise());
    const spiders = await this.backendService.listAllSpiders().toPromise();

    nodes.nodes.forEach(nodeId => {
      if (nodeId.toLowerCase().includes(nodeIdKeyword)) {
        spiders.spiders.forEach(spiderName => {
          if (spiderName.toLowerCase().includes(spiderNameKeyword)) {
            console.log(nodeId + ':' + spiderName)
            // this.backendService.scheduleSpider(spiderName).subscribe(
            //   r => console.log(r)
            // );
          }
        });
      }
    });

  }



  private async cancelSpidersByKeword(keyword: string) {
    keyword = keyword.toLowerCase();

    const jobs = await this.backendService.listJobs().toPromise();

    [...jobs.running, ...jobs.pending].forEach(job => {
      if (
        job.spider.toLowerCase().includes(keyword)
        || job.id.toLowerCase().includes(keyword)
      ) {
        this.backendService.cancelJob(job.id);
      }
    });
  }


  private listJobs() {
    this.backendService.listJobs().subscribe(
      response => console.log(response)
    );
  }


  private cancelAllJobs() {
    this.backendService.cancelAllJobs();
  }


  private updateJobsInfo() {
    this.backendService.listJobs().subscribe(
      info => this.jobsListInfo = info
    );
  }


  private updateLastScrapedArticlesInfo() {
    this.backendService.getLastScrapedArticlesInfo(NUMBER_OF_DISPLAYED_ARTICLES)
      .subscribe(
        response => this.lastScrapedArticlesInfo = response
      );
  }
}
