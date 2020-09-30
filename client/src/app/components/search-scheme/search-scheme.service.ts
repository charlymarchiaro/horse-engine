import { Injectable } from '@angular/core';
import { SearchSchemeKind, SearchScheme, ArticleSearchSchemeImpl, ArticlePart, MatchCondition, Field, Condition, SearchSchemePayload } from '../../model/search-scheme.model';
import { BackendService } from '../../services/backend.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadStateHandler } from '../../services/utils/load-status';


const DEFAULT_SCHEME_VERSION = '1';

const NEW_SCHEME_NAME = 'Untitled';


@Injectable({
  providedIn: 'root'
})
export class SearchSchemeService {


  private schemesSubject = new BehaviorSubject<SearchScheme[]>([]);
  public schemes$ = this.schemesSubject.asObservable();

  private loadState = new LoadStateHandler();
  public loadState$ = this.loadState.state$;


  constructor(
    private backendService: BackendService,
  ) { }


  public async getAllSchemes(): Promise<SearchScheme[]> {

    this.loadState.startLoad();
    let schemes: SearchScheme[] = [];

    try {
      // Article
      const articleSchemes = await this.backendService.getArticleSearchSchemes().toPromise();
      schemes = [...schemes, ...articleSchemes];

      this.loadState.loadSuccess();
      this.schemesSubject.next(schemes);
      return schemes;

    } catch (error) {
      this.loadState.loadError(error.message);
    }
  }


  public async createEmptyScheme(kind: SearchSchemeKind): Promise<SearchScheme> {

    let newScheme: SearchScheme;

    switch (kind) {
      case SearchSchemeKind.article: {
        const scheme: ArticleSearchSchemeImpl = {
          matchConditions: { or: [] },
          secondaryMatchConditions: [],
          titleMatchKeywords: [],
        };

        const searchSchemepayload: SearchSchemePayload = {
          name: this.getNewSchemeName(NEW_SCHEME_NAME, kind),
          description: '',
          version: DEFAULT_SCHEME_VERSION,
          scheme
        };

        newScheme = await this.backendService.postArticleSearchScheme(searchSchemepayload).toPromise();
      }
    }

    await this.getAllSchemes();
    return newScheme;
  }


  public async createSchemeCopy(scheme: SearchScheme): Promise<SearchScheme> {

    const kind = scheme.kind;

    let newScheme: SearchScheme;

    switch (kind) {
      case SearchSchemeKind.article: {

        const searchSchemepayload: SearchSchemePayload = {
          name: this.getNewSchemeName('Copy of ' + scheme.name, kind),
          description: scheme.description,
          version: scheme.version,
          scheme: scheme.scheme,
        };

        newScheme = await this.backendService.postArticleSearchScheme(searchSchemepayload).toPromise();
      }
    }

    await this.getAllSchemes();
    return newScheme;
  }


  public async deleteScheme(scheme: SearchScheme) {
    switch (scheme.kind) {
      case SearchSchemeKind.article: {
        await this.backendService.deleteArticleSearchScheme(scheme.id).toPromise();
      }
    }

    await this.getAllSchemes();
    return;
  }


  public async updateScheme(scheme: SearchScheme) {
    switch (scheme.kind) {
      case SearchSchemeKind.article: {

        const searchSchemepayload: SearchSchemePayload = {
          id: scheme.id,
          name: scheme.name,
          description: scheme.description,
          version: scheme.version,
          scheme: scheme.scheme
        };

        await this.backendService.patchArticleSearchScheme(searchSchemepayload).toPromise();
      }
    }

    await this.getAllSchemes();
    return;
  }


  public getNewSchemeName(baseName: string, kind: SearchSchemeKind) {

    const schemes = this.schemesSubject.getValue().filter(
      s => s.kind === kind
    );

    for (let i = 0; i < 10000000; i++) {
      const name = baseName + (i > 0 ? ` (${i})` : '');

      if (schemes.findIndex(s => s.name === name) === -1) {
        return name;
      }
    }

    throw new Error('Could not generate a new search scheme name.');
  }
}
