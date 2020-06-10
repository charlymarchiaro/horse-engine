import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ArticleScrapingDetails } from '../../../../model/article.model';
import { DatePipe } from '@angular/common';


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
      'View'
    ];

    this.tableData = this.data.map<TableFieldInfo[]>(i => [
      { type: 'label', value: i.article.articleSource.name, },
      { type: 'link', value: 'http://' + i.article.url, label: 'Link', linkType: 'newTab' },
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
      {
        type: 'link',
        value: `/api/articles/${i.article.id}?filter=%7B%0A%20%20%22include%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22relation%22%3A%20%22articleScrapingDetails%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22scope%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22include%22%3A%20%5B%7B%20%22relation%22%3A%20%22articleSpider%22%20%7D%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%7B%20%22relation%22%3A%20%22articleSource%22%20%7D%0A%20%20%5D%0A%7D`,
        label: 'View',
        linkType: 'newWindow'
      },
    ]);
  }


  private makeEllipsis(text: string, characters: number): string {
    return (text && text.length > characters - 3)
      ? text.substr(0, characters - 3) + '...'
      : text;
  }
}
