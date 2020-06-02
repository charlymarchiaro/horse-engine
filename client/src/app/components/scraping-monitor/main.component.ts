import { Component, OnInit, OnDestroy } from '@angular/core';

import { JobsListInfo } from './model/scrapyd/scrapyd.model';
import { BackendService } from '../../services/backend.service';
import { ArticleScrapingDetails } from '../../model/article-scraping-details.model';




export const SPIDER_NAMES = [
  'clarin_crawl',
  'clarin_sitemap',
  'cronista_crawl',
  'cronista_sitemap',
  'infobae_crawl',
  'infobae_sitemap',
  'la_nacion_crawl',
  'la_nacion_sitemap',
  'metro951_crawl',
  'metro951_sitemap',
];


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
  public lastScrapedArticlesInfo: ArticleScrapingDetails[] = [];



  constructor(
    private backendService: BackendService,
  ) { }


  ngOnInit() {
    this.jobsPollingTimer = setInterval(
      () => this.updateJobsInfo(),
      1000
    );

    this.lastScrapedArticlesInfoTimer = setInterval(
      () => this.updateLastScrapedArticlesInfo(),
      2000
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


  public onListJobsClick() {
    this.listJobs();
  }


  public onCancelAllJobsClick() {
    this.cancelAllJobs();
  }


  private listAllSpiders() {
    this.backendService.listAllSpiders().subscribe(
      response => console.log(response)
    );
  }


  private scheduleAllSpiders() {
    for (const spiderName of SPIDER_NAMES) {
      this.backendService.scheduleSpider(spiderName).subscribe(
        response => console.log(response)
      );
    }
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
