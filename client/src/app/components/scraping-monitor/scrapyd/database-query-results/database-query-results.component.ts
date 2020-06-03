import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ArticleScrapingDetails } from '../../../../model/article-scraping-details.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-database-query-results',
  templateUrl: './database-query-results.component.html',
  styleUrls: ['./database-query-results.component.scss']
})
export class DatabaseQueryResultsComponent implements OnInit, OnChanges {


  public tableHeaders: string[] = [];
  public tableData: string[][] = [];

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
      'Title',
      'Text',
      'Last Updated',
      'Scraped At',
      'Spider Name',
      'Result',
      'Parse Function',
    ];

    this.tableData = this.data.map(i => [
      i.article.articleSource.name,
      this.makeEllipsis(i.article.title, 30),
      this.makeEllipsis(i.article.text, 30),
      i.article.lastUpdated
        ? this.datePipe.transform(i.article.lastUpdated, 'MMM d, y, H:mm:ss')
        : '—',
      this.datePipe.transform(i.scrapedAt, 'MMM d, y, H:mm:ss'),
      i.articleSpider.name,
      i.result,
      i.parseFunction || '—',
    ]);
  }


  private makeEllipsis(text: string, characters: number): string {
    return (text.length > characters - 3)
      ? text.substr(0, characters - 3) + '...'
      : text;
  }
}
