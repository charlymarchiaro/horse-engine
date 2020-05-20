import { Component, OnInit, OnDestroy } from '@angular/core';

import { ArticleFilteringSchemeEditorComponent } from './article-filtering-scheme-editor/article-filtering-scheme-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { ArticleFilteringScheme, DateSpan, ArticlePart, MatchCondition } from './model';
import { BackendService } from '../../services/backend.service';
import { ApiRequestState } from '../../model/backend.model';
import { Subscription } from 'rxjs';
import { Article } from '../../model/article.model';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {


  public scheme: ArticleFilteringScheme;
  private dateSpan: DateSpan;


  public articles: Article[] = [];


  public requestState: ApiRequestState = {
    loaded: false,
    loading: false,
    error: null,
  };


  private backendSubscription = new Subscription();


  constructor(
    private backendService: BackendService,
    public schemeEditorDialog: MatDialog
  ) {
    this.scheme = {
      conditions: [[{
        part: ArticlePart.text,
        matchCondition: MatchCondition.contains,
        textToMatch: 'aaaa',
        caseSensitive: true,
      }]]
    };
  }


  ngOnInit() {
  }


  ngOnDestroy() {
    this.backendSubscription.unsubscribe();
  }


  public onSubmitClick() {
    this.backendSubscription.unsubscribe();

    this.requestState = {
      loaded: false,
      loading: true,
      error: null
    };

    this.articles = [];

    this.backendSubscription = this.backendService.searchArticles(
      this.scheme,
      this.dateSpan
    ).subscribe(
      response => {
        if (response.status === 'success') {
          this.onRequestSuccess(response.data);
        } else {
          this.onRequestError(null);
        }
      },
      error => this.onRequestError(error)
    );
  }


  private onRequestSuccess(articles: Article[]) {
    this.requestState = {
      loaded: true,
      loading: false,
      error: null,
    };

    console.log(articles)
    this.articles = articles;
  }


  private onRequestError(error) {
    this.requestState = {
      loaded: false,
      loading: false,
      error: error ? error.message : 'Unknown error',
    };
  }


  public onDateSpanChange(dateSpan: DateSpan) {
    this.dateSpan = dateSpan;
  }


  public onEditFilteringSchemeClick() {
    this.showFilteringSchemeEditor();
  }


  public onClearFilteringSchemeClick() {
    this.scheme = null;
  }


  private showFilteringSchemeEditor() {
    const dialogRef = this.schemeEditorDialog.open(
      ArticleFilteringSchemeEditorComponent, {
      disableClose: true,
      data: {
        scheme: this.scheme
      }
    });

    dialogRef.afterClosed().subscribe(
      (result: ArticleFilteringScheme) => {
        if (!result) {
          return;
        }
        this.scheme = { ...result };
      }
    );
  }
}
