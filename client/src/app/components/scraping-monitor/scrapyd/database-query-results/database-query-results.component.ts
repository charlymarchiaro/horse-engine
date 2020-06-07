import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ArticleScrapingDetails } from '../../../../model/article.model';
import { DatePipe } from '@angular/common';


interface TableFieldInfo {
  type: 'label' | 'link';
  value: string;
  label?: string;
}


@Component({
  selector: 'app-database-query-results',
  templateUrl: './database-query-results.component.html',
  styleUrls: ['./database-query-results.component.scss']
})
export class DatabaseQueryResultsComponent implements OnInit, OnChanges {


  public tableHeaders: string[] = [];
  public tableData: TableFieldInfo[][] = [];

  @Input() public data: ArticleScrapingDetails[] = [];


  constructor(
    private datePipe: DatePipe,
  ) { }


  ngOnInit() {
  }


  ngOnChanges(changes: SimpleChanges) {
    this.updateTable();
  }


  private updateTable() {
    if (!this.data || this.data.length === 0) {
      this.tableHeaders = [];
      this.tableData = [];
      return;
    }

    this.tableHeaders = [
      'Source',
      'URL',
      'Title',
      'Text',
      'Last Updated',
      'Scraped At',
      'Spider Name',
      'Result',
      'Parse Function',
    ];

    this.tableData = this.data.map(i => [
      { type: 'label', value: i.article.articleSource.name, },
      { type: 'link', value: 'http://' + i.article.url, label: 'Link' },
      { type: 'label', value: this.makeEllipsis(i.article.title, 30) || '—', },
      { type: 'label', value: this.makeEllipsis(i.article.text, 30) || '—', },
      {
        type: 'label',
        value: i.article.lastUpdated ? this.datePipe.transform(i.article.lastUpdated, 'MMM d, y, H:mm:ss') : '—',
      },
      { type: 'label', value: this.datePipe.transform(i.scrapedAt, 'MMM d, y, H:mm:ss'), },
      { type: 'label', value: i.articleSpider.name, },
      { type: 'label', value: i.result, },
      { type: 'label', value: i.parseFunction || '—', },
    ]);
  }


  private makeEllipsis(text: string, characters: number): string {
    return (text && text.length > characters - 3)
      ? text.substr(0, characters - 3) + '...'
      : text;
  }
}
