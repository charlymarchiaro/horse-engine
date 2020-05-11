import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';



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
    return this.http.get<{ node_name: string, status: string, spiders: string[] }>(
      '/api/list-spiders'
    );
  }


  public scheduleSpider(spiderName: string) {
    const params = JSON.stringify({
      spiderName
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(
      '/api/schedule-spider',
      params,
      { headers }
    );
  }


  public listJobs() {
    return this.http.get<{ node_name: string, status: string, spiders: string[] }>(
      '/api/list-jobs'
    );
  }
}

