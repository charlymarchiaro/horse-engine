import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Article, ArticleSummary } from '../../../../model/article.model';


interface TableFieldInfo {
  type: 'label' | 'link';
  value: string;
  label?: string;
  linkType?: 'newTab' | 'newWindow';
}


@Component({
  selector: 'app-database-query-results',
  templateUrl: './database-query-results.component.html',
  styleUrls: ['./database-query-results.component.scss']
})
export class DatabaseQueryResultsComponent implements OnInit, OnChanges {


  public tableHeaders: string[] = [];
  public tableData: TableFieldInfo[][] = [];

  public window = window;

  @Input() public data: ArticleSummary[] = [];


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
      'View',
      'Title',
      'Text',
      'Last Updated',
      'Scraped At',
      'Spider Name',
      'Result',
      'Parse Function',
      'Scrapyd Node id',
    ];

    this.tableData = this.data.map<TableFieldInfo[]>(i => [
      { type: 'label', value: i.sourceName, },
      { type: 'link', value: i.url, label: 'Link', linkType: 'newTab' },
      {
        type: 'link',
        value: `/article-preview/${i.id}`,
        label: 'View',
        linkType: 'newTab'
      },
      { type: 'label', value: this.makeEllipsis(i.title, 30) || '—', },
      { type: 'label', value: this.makeEllipsis(i.text, 30) || '—', },
      {
        type: 'label',
        value: i.lastUpdated ? this.datePipe.transform(i.lastUpdated, 'MMM d, y, H:mm:ss') : '—',
      },
      { type: 'label', value: this.datePipe.transform(i.scrapedAt, 'MMM d, y, H:mm:ss'), },
      { type: 'label', value: i.spiderName, },
      { type: 'label', value: i.result, },
      { type: 'label', value: i.parseFunction || '—', },
      { type: 'label', value: i.scrapydNodeId || '—', },
    ]);
  }


  private makeEllipsis(text: string, characters: number): string {
    return (text && text.length > characters - 3)
      ? text.substr(0, characters - 3) + '...'
      : text;
  }
}
