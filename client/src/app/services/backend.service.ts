import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';


const API_URL = 'http://localhost:6800';


@Injectable({
  providedIn: 'root'
})
export class BackendService {


  constructor(
    private http: HttpClient,
  ) { }


  public listAllSpiders() {
    return this.http.get<{ node_name: string, status: string, spiders: string[] }>(
      API_URL + '/listspiders.json?project=horse_scraper'
    );
  }


  public scheduleSpider(spiderName: string) {

    const formData = new FormData();
    formData.set('project', 'horse_scraper');
    formData.set('spider', spiderName);

    return this.http.post<any>(
      API_URL + '/schedule.json',
      formData,
    );
  }
}
