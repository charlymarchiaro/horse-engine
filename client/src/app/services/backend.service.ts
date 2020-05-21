import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JobsListInfo, JobScheduleInfo, SpidersListInfo } from '../components/scraping-monitor/model/scrapyd/scrapyd.model';
import { DatabaseQueryResultsRow } from '../components/scraping-monitor/model/shared/database.model';
import { ArticleFilteringScheme, DateSpan } from '../components/keyword-search/model';
import { Article } from '../model/article.model';
import { ResponseStatus } from '../model/backend.model';




@Injectable({
  providedIn: 'root'
})
export class BackendService {


  constructor(
    private http: HttpClient,
  ) {

    this.http.get(
      '/api',
      { responseType: 'text' }
    )
      .subscribe(
        response => console.log(response),
        error => console.error(error)
      );
  }


  public testBackend() {
    return this.http.get<any>(
      '/api/backend/test'
    );
  }



  // Scraper

  public listAllSpiders() {
    return this.http.get<SpidersListInfo>(
      '/api/list-spiders'
    );
  }


  public scheduleSpider(spiderName: string) {
    const params = JSON.stringify({
      spiderName
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<JobScheduleInfo>(
      '/api/schedule-spider',
      params,
      { headers }
    );
  }


  public listJobs() {
    return this.http.get<JobsListInfo>(
      '/api/list-jobs'
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
            '/api/cancel-job',
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


  public getLastScrapedArticlesInfo(numberOfArticles: number) {
    const params = JSON.stringify({
      numberOfArticles
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<{ data: DatabaseQueryResultsRow[] }>(
      '/api/last-scraped-articles-info',
      params,
      { headers }
    );
  }


  // Keyword search
  public searchArticles(scheme: ArticleFilteringScheme, dateSpan: DateSpan) {
    const params = JSON.stringify({
      scheme,
      dateSpan,
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<{ status: ResponseStatus; data: any[]; }>(
      '/api/article/search',
      params,
      { headers }
    ).map(r => ({
      status: r.status,
      data: r.data.map(a => ({
        id: a.id,
        sourceName: a.source_name,
        url: a.url,
        title: a.title,
        text: a.text,
        lastUpdated: a.last_updated,
        scrapedAt: a.scraped_at,
        spiderName: a.spider_name,
        parseFunction: a.parse_function,
        result: a.result,
        error: a.error,
        errorDetails: a.error_details,
      }))
    }));
  }
}

