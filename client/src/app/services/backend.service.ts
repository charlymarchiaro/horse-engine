import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JobsListInfo, JobScheduleInfo, SpidersListInfo } from '../model/scrapyd/scrapyd.model';
import { DatabaseQueryResultsRow } from '../model/shared/database.model';



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
}

