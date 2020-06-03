import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JobsListInfo, JobScheduleInfo, SpidersListInfo } from '../components/scraping-monitor/model/scrapyd/scrapyd.model';
import { DatabaseQueryResultsRow } from '../components/scraping-monitor/model/shared/database.model';
import { ArticleFilteringScheme, DateSpan, getArticleFilteringSchemeWhereCondition } from '../components/keyword-search/model';
import { ResponseStatus } from '../model/backend.model';

import { ArticleScrapingDetails, ArticleScrapingDetailsResponse } from '../model/article-scraping-details.model';
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


  public cancelAllJobs(force: boolean = true) {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.listJobs().subscribe(res => {

      [...res.running, ...res.pending].forEach(job => {

        const params = JSON.stringify({
          job: job.id
        });

        const times = force ? 2 : 1;

        for (let i = 0; i < times; i++) {
          this.http.post<JobScheduleInfo>(
            '/api/scrapyd/cancel-job',
            params,
            { headers }
          ).subscribe(
            res => console.log(res),
            err => console.error(err)
          );
        }
      });
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
}

