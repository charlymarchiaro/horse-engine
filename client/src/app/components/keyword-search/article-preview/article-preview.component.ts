import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Article } from '../../../model/article.model';

@Component({
  selector: 'app-article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.scss']
})
export class ArticlePreviewComponent implements OnInit, OnChanges {


  public title: string;
  public subtitle: string;
  public paragraphs: string[] = [];


  @Input() article: Article;


  constructor() { }


  ngOnInit() {
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!this.article || this.article.result.trim() !== 'success') {
      this.title = null;
      this.subtitle = null;
      this.paragraphs = [];
      return;
    }

    const titleParts = this.article.title.split(new RegExp(/\|+/));

    this.title = titleParts[0];
    this.subtitle = titleParts.length > 1 ? titleParts[1] : null;

    this.paragraphs = this.article.text.split(new RegExp(/\|+/));
  }

}
