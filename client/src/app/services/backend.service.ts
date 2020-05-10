import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';


const API_URL = 'http://localhost/api';
const SCRAPYD_URL = 'http://localhost/scrapyd';

@Injectable({
  providedIn: 'root'
})
export class BackendService {


  constructor(
    private http: HttpClient,
  ) { }


  public testBackend() {
    return this.http.get<any>(
      API_URL + '/backend/test'
    );
  }


  public listAllSpiders() {
    return this.http.get<{ node_name: string, status: string, spiders: string[] }>(
      API_URL + '/list-spiders'
    );
  }


  public scheduleSpider(spiderName: string) {
    const params = JSON.stringify({
      spiderName
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(
      API_URL + '/schedule-spider',
      params,
      { headers }
    );
  }


  public listJobs() {
    return this.http.get<{ node_name: string, status: string, spiders: string[] }>(
      API_URL + '/list-jobs'
    );
  }
}

