import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JobsListInfo, JobScheduleInfo, SpidersListInfo } from '../model/scrapyd.model';
import { ArticleFilteringScheme, DateSpan, getArticleFilteringSchemeWhereCondition } from '../components/keyword-search/model';

import { ArticleScrapingDetails, ArticleScrapingDetailsResponse, ArticleSpiderResponse, ArticleSpider, ArticleScrapingStatsResponse, ArticleScrapingStatsFullResponse, ArticleScrapingStats, ArticleScrapingStatsFull } from '../model/article.model';
import { ArticleResponse, Article } from '../model/article.model';


@Injectable({
  providedIn: 'root'
})
export class BackendService {


  constructor(
    private http: HttpClient,
  ) { }



  // Scraper

  public listAllSpiders() {
    return this.http.get<SpidersListInfo>(
      '/api/scrapyd/list-spiders'
    );
  }


  public listAllSpidersDetail() {
    const params = {
      filter: JSON.stringify({
        include: [
          {
            relation: 'articleSource',
          },
        ]
      })
    };

    return this.http.get<ArticleSpiderResponse[]>(
      '/api/article-spiders', { params }
    ).map(r => r.map(i => new ArticleSpider(i)));
  }


  public scheduleSpider(spiderName: string) {
    const params = JSON.stringify({
      spiderName
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<JobScheduleInfo>(
      '/api/scrapyd/schedule-spider',
      params,
      { headers }
    );
  }


  public listJobs() {
    return this.http.get<JobsListInfo>(
      '/api/scrapyd/list-jobs'
    );
  }


  public cancelJob(jobId: string, force: boolean = true) {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = JSON.stringify({
      job: jobId
    });

    const times = force ? 2 : 1;

    for (let i = 0; i < times; i++) {
      this.http.post<JobScheduleInfo>(
        '/api/scrapyd/cancel-job',
        params,
        { headers }
      ).subscribe(
        r => console.log(r),
        err => console.error(err)
      );
    }
  }


  public cancelAllJobs(force: boolean = true) {
    this.listJobs().subscribe(res => {
      [...res.running, ...res.pending]
        .forEach(job => this.cancelJob(job.id, force));
    });
  }


  // Last scraped articles
  public getLastScrapedArticlesInfo(numberOfArticles: number) {
    const params = {
      filter: JSON.stringify({
        limit: numberOfArticles,
        order: [
          'scrapedAt DESC',
          'id'
        ],
        include: [
          {
            relation: 'article',
            scope: {
              include: [{ relation: 'articleSource' }]
            }
          },
          { relation: 'articleSpider' }
        ]
      })
    };

    return this.http.get<ArticleScrapingDetailsResponse[]>(
      '/api/article-scraping-details', { params }
    ).map(r => r.map(i => new ArticleScrapingDetails(i)));
  }


  // Keyword search
  public searchArticles(scheme: ArticleFilteringScheme, dateSpan: DateSpan) {

    // Copy the object
    const startDate = new Date(dateSpan.fromDateIncl);
    startDate.setHours(0, 0, 0, 0);

    // Copy the object
    const endDate = new Date(dateSpan.toDateIncl);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);

    const schemeWhereConditions = getArticleFilteringSchemeWhereCondition(scheme);

    const params = {
      filter: JSON.stringify({
        order: [
          'lastUpdated'
        ],
        where: {
          and: [
            { lastUpdated: { gt: startDate } },
            { lastUpdated: { lt: endDate } },
            schemeWhereConditions
          ]
        },
        include: [
          {
            relation: 'articleScrapingDetails',
            scope: {
              include: [{ relation: 'articleSpider' }]
            }
          },
          { relation: 'articleSource' }
        ]
      })
    };

    return this.http.get<ArticleResponse[]>(
      '/api/articles', { params },
    ).map(r => r.map(i => new Article(i)));
  }


  // Article stats
  public getArticleStatsFull() {
    const params = {};

    return this.http.get<ArticleScrapingStatsFullResponse>(
      '/api/article-stats/full-stats', { params }
    ).map(r => new ArticleScrapingStatsFull(r));
  }
}

