import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { JobsListInfo, JobScheduleInfo, SpidersListInfo, ScrapydNodeListInfo } from '../model/scrapyd.model';
import { ArticleSpiderResponse, ArticleSpider, ArticleScrapingStatsFullResponse, ArticleScrapingStatsFull, ArticleSourceResponse, ArticleSource, ArticleSummaryResponse, ArticleSummary } from '../model/article.model';
import { ArticleResponse, Article } from '../model/article.model';
import { SearchScheme, SearchSchemeKind, SearchSchemePayload } from '../model/search-scheme.model';
import { ArticleSearchBooleanQueryPayload, ArticleSearchBooleanQueryResponse, ArticleSearchBooleanQueryResult, CancelSearchResponse } from '../model/search.model';
import 'rxjs/Rx';


@Injectable({
  providedIn: 'root'
})
export class BackendService {


  constructor(
    private http: HttpClient,
  ) { }



  // Scraper

  public listAllScrapydNodes() {
    return this.http.get<ScrapydNodeListInfo>(
      '/api/scrapyd/list-scrapyd-nodes'
    );
  }


  public listAllSpiders(scrapydNodeId: string) {
    const params = new HttpParams()
      .set('scrapydNodeId', scrapydNodeId);

    return this.http.get<SpidersListInfo>(
      '/api/scrapyd/list-spiders',
      { params }
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


  public scheduleSpider(scrapydNodeId: string, spiderName: string) {
    const params = JSON.stringify({
      scrapydNodeId,
      spiderName
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<JobScheduleInfo>(
      '/api/scrapyd/schedule-spider',
      params,
      { headers }
    );
  }


  public scheduleAllSpiders(scrapydNodeId: string) {
    const params = JSON.stringify({
      scrapydNodeId
    });

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<{ items: JobScheduleInfo[] }>(
      '/api/scrapyd/schedule-all-spiders',
      params,
      { headers }
    );
  }


  public listJobs(scrapydNodeId: string) {
    const params = new HttpParams()
      .set('scrapydNodeId', scrapydNodeId);

    return this.http.get<JobsListInfo>(
      '/api/scrapyd/list-jobs',
      { params }
    );
  }


  public cancelJob(scrapydNodeId: string, jobId: string, force: boolean = true) {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const params = JSON.stringify({
      scrapydNodeId,
      job: jobId,
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


  public cancelAllJobs(scrapydNodeId: string, force: boolean = true) {
    this.listJobs(scrapydNodeId).subscribe(res => {
      [...res.running, ...res.pending]
        .forEach(job => this.cancelJob(scrapydNodeId, job.id, force));
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
      })
    };

    return this.http.get<ArticleSummaryResponse[]>(
      '/api/last-scraped-articles', { params }
    ).map(r => r.map(i => new ArticleSummary(i)));
  }


  // Articles by id
  public getArticles(ids: string[]) {

    const params = {
      filter: JSON.stringify({
        order: [
          'lastUpdated'
        ],
        where: {
          id: { inq: ids },
        },
        include: [
          { relation: 'articleSpider' },
          { relation: 'articleSource' }
        ]
      })
    };

    return this.http.get<ArticleResponse[]>(
      '/api/articles', { params },
    ).map(r => r.map(i => new Article(i)));
  }


  // Article source
  public getArticleSources() {
    const params = {};

    return this.http.get<ArticleSourceResponse[]>(
      '/api/article-sources', { params }
    ).map(r => r.map(i => new ArticleSource(i)));
  }


  // Article stats
  public getArticleStatsFull() {
    const params = {};

    return this.http.get<ArticleScrapingStatsFullResponse>(
      '/api/article-stats/full-stats', { params }
    ).map(r => new ArticleScrapingStatsFull(r));
  }


  // Search scheme
  public getArticleSearchSchemes() {
    const params = {
      filter: JSON.stringify({
        include: [
          { relation: 'user' }
        ]
      })
    };

    return this.http.get<SearchSchemePayload[]>(
      '/api/article-search-schemes', { params }
    ).map(r => r.map(ssp => new SearchScheme(ssp, SearchSchemeKind.article)));
  }

  public postArticleSearchScheme(scheme: SearchSchemePayload) {

    return this.http.post<SearchSchemePayload>(
      '/api/article-search-schemes', scheme
    ).map(ssr => new SearchScheme(ssr, SearchSchemeKind.article));
  }

  public deleteArticleSearchScheme(id: string) {

    return this.http.delete(
      '/api/article-search-schemes/' + id
    );
  }

  public patchArticleSearchScheme(scheme: SearchSchemePayload) {

    return this.http.patch(
      '/api/article-search-schemes/' + scheme.id, scheme
    );
  }


  // Search
  public articleSearchBooleanQuery(payload: ArticleSearchBooleanQueryPayload) {

    return this.http.post<ArticleSearchBooleanQueryResponse>(
      '/api/article-search/boolean-query', payload
    ).map(r => new ArticleSearchBooleanQueryResult(r));
  }


  public cancelArticleSearch(pidTag: string) {
    const params = {
      pidTag
    };

    return this.http.post<CancelSearchResponse>(
      '/api/article-search/cancel-search', params
    );
  }
}

