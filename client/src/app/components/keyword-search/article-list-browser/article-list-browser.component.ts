import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Article } from '../../../model/article.model';
import { PageEvent } from '@angular/material';


export interface ArticleSelectEventArgs {
  articleId: number;
}


@Component({
  selector: 'app-article-list-browser',
  templateUrl: './article-list-browser.component.html',
  styleUrls: ['./article-list-browser.component.scss']
})
export class ArticleListBrowserComponent implements OnInit, OnChanges {

  public window = window;

  public pageIndex = 0;
  public pageSize = 5;
  public pageSizeOptions = [5, 10, 20, 50, 100];

  public displayedRegisters: Article[] = [];


  public selectedArticleId: number;


  @Input() public articles: Article[] = [];
  @Output() public select = new EventEmitter<ArticleSelectEventArgs>();


  constructor() { }


  ngOnInit() {
    this.updateDisplayedRegisters();
  }


  ngOnChanges(changes: SimpleChanges) {

    if (this.articles && this.articles.length > 0) {
      this.selectedArticleId = this.articles[0].id;
      this.select.emit({ articleId: this.selectedArticleId });

    } else {
      this.selectedArticleId = 0;
    }
  }



  public onPageEvent(event: PageEvent) {
    try {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.updateDisplayedRegisters();

    } catch (e) {
      console.error(e);
    }
  }


  public onArticleSelect(article: Article) {
    this.selectedArticleId = article.id;
    this.select.emit({ articleId: article.id });
  }


  private updateDisplayedRegisters() {
    this.displayedRegisters = this.articles.slice(
      this.pageIndex * this.pageSize,
      (this.pageIndex + 1) * this.pageSize
    );
  }
}
