import { Component, OnInit, Input, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { HighlightedArticle } from '../../../model/search.model';

@Component({
  selector: 'app-search-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss']
})
export class DocumentPreviewComponent implements OnInit, OnChanges {

  public title: string;
  public subtitle: string;
  public paragraphs: string[] = [];


  @ViewChild('cardBlock', { static: false }) cardBlock: ElementRef;

  @Input() article: HighlightedArticle;


  constructor() { }


  ngOnInit() {

  }



  ngOnChanges(changes: SimpleChanges) {

    if (
      !this.article
      || !this.article.article
      || this.article.article.result !== 'success'
    ) {
      this.title = null;
      this.subtitle = null;
      this.paragraphs = [];
      return;
    }

    const titleParts = this.article.markedTitleHtml.split(new RegExp(/\|+/));

    this.title = titleParts[0];
    this.subtitle = titleParts.length > 1 ? titleParts[1] : null;

    this.paragraphs = this.article.markedTextHtml.split(new RegExp(/\|+/));

    if (this.cardBlock) {
      this.cardBlock.nativeElement.scrollTop = 0;
    }
  }
}
