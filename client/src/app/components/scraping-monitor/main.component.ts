import { Component, OnInit, OnDestroy } from '@angular/core';

import { JobsListInfo } from '../../model/scrapyd.model';
import { BackendService } from '../../services/backend.service';
import { Article, ArticleSummary } from '../../model/article.model';
import { isNull } from 'util';



export const NUMBER_OF_DISPLAYED_ARTICLES = 10;


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private jobsPollingTimer;
  private lastScrapedArticlesInfoTimer;

  public jobsListInfo: { [nodeId: string]: JobsListInfo } = {};
  public lastScrapedArticlesInfo: ArticleSummary[] = [];


  public scheduleKeyword = '';
  public cancelKeyword = '';

  public objectKeys = Object.keys;


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


  public onScheduleByKeywordClick() {
    this.scheduleSpidersByKeword(this.scheduleKeyword);
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


  private async scheduleSpidersByKeword(keyword: string) {
    keyword = keyword.toLowerCase();

    const params = keyword.split(':');
    if (params.length !== 2) {
      return;
    }

    const nodeIdKeyword = params[0];
    const spiderNameKeyword = params[1];

    const nodes = (await this.backendService.listAllScrapydNodes().toPromise());

    for (const nodeId of nodes.nodes) {

      const spiders = await this.backendService.listAllSpiders(nodeId).toPromise();

      if (nodeId.toLowerCase().includes(nodeIdKeyword)) {
        spiders.spiders.forEach(spiderName => {
          if (spiderName.toLowerCase().includes(spiderNameKeyword)) {
            console.log(nodeId + ':' + spiderName)
            this.backendService.scheduleSpider(nodeId, spiderName).subscribe(
              r => console.log(r)
            );
          }
        });
      }
    }
  }



  private async cancelSpidersByKeword(keyword: string) {
    keyword = keyword.toLowerCase();

    const params = keyword.split(':');
    if (params.length > 2 || params.length === 0) {
      return;
    }

    let nodeIdKeyword;
    let spiderNameKeyword;

    if (params.length === 2) {
      nodeIdKeyword = params[0];
      spiderNameKeyword = params[1];
    } else {
      nodeIdKeyword = null;
      spiderNameKeyword = params[0];
    }

    const nodes = (await this.backendService.listAllScrapydNodes().toPromise());

    for (const nodeId of nodes.nodes) {
      if (
        // If nodeId unspecified, try all nodes
        isNull(nodeIdKeyword)
        || nodeId.toLowerCase().includes(nodeIdKeyword)
      ) {

        const jobs = await this.backendService.listJobs(nodeId).toPromise();

        [...jobs.running, ...jobs.pending].forEach(job => {
          if (
            job.spider.toLowerCase().includes(keyword)
            || job.id.toLowerCase().includes(keyword)
          ) {
            this.backendService.cancelJob(nodeId, job.id);
          }
        });
      }
    }
  }


  private async cancelAllJobs() {
    const nodes = (await this.backendService.listAllScrapydNodes().toPromise());

    for (const nodeId of nodes.nodes) {
      this.backendService.cancelAllJobs(nodeId);
    }
  }


  private async updateJobsInfo() {
    const nodes = (await this.backendService.listAllScrapydNodes().toPromise());

    for (const nodeId of nodes.nodes) {
      this.backendService.listJobs(nodeId).subscribe(
        info => this.jobsListInfo[nodeId] = info
      );
    }
  }


  private updateLastScrapedArticlesInfo() {
    this.backendService.getLastScrapedArticlesInfo(NUMBER_OF_DISPLAYED_ARTICLES)
      .subscribe(
        response => this.lastScrapedArticlesInfo = response
      );
  }
}
