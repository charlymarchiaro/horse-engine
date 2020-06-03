import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Article } from '../../../model/article.model';
import { PageEvent } from '@angular/material';
import { DatePipe } from '@angular/common';
import { ExcelExportService, ColConfig } from '../excel-export.service';
import { ArticleFilteringScheme, DateSpan } from '../model';
import { ColInfo } from 'xlsx/types';



export interface Params {
  scheme: ArticleFilteringScheme;
  dateSpan: DateSpan;
}


export interface ArticleSelectEventArgs {
  articleId: string;
}


@Component({
  selector: 'app-article-list-browser',
  templateUrl: './article-list-browser.component.html',
  styleUrls: ['./article-list-browser.component.scss']
})
export class ArticleListBrowserComponent implements OnInit, OnChanges {

  public window = window;

  public pageIndex = 0;
  public pageSize = 10;
  public pageSizeOptions = [5, 10, 20, 50, 100];

  public displayedRegisters: Article[] = [];


  public selectedArticleId: string;


  @Input() public articles: Article[] = [];
  @Input() public params: Params;
  @Output() public select = new EventEmitter<ArticleSelectEventArgs>();


  constructor(
    private excelExport: ExcelExportService,
    private datePipe: DatePipe,
  ) { }


  ngOnInit() {
    this.updateDisplayedRegisters();
  }


  ngOnChanges(changes: SimpleChanges) {

    if (this.articles && this.articles.length > 0) {
      this.selectedArticleId = this.articles[0].id;
      this.select.emit({ articleId: this.selectedArticleId });

    } else {
      this.selectedArticleId = null;
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


  public onExportToExcelButtonClick() {
    this.exportToExcel();
  }


  private updateDisplayedRegisters() {
    this.displayedRegisters = this.articles.slice(
      this.pageIndex * this.pageSize,
      (this.pageIndex + 1) * this.pageSize
    );
  }


  private exportToExcel() {
    if (!this.articles || this.articles.length === 0) {
      return;
    }

    const fileName = 'Article search - ' + this.datePipe.transform(Date.now(), 'dd-MM-yyyy') + '.xlsx';

    const startDate = this.datePipe.transform(
      this.params.dateSpan.fromDateIncl,
      'dd/MM/yyyy'
    );

    const endDate = this.datePipe.transform(
      this.params.dateSpan.toDateIncl,
      'dd/MM/yyyy'
    );

    const period = `Desde: ${startDate} - Hasta: ${endDate}`;

    const data = [
      [
        'País',
        'Medio',
        'Categoría',
        'Tier',
        'Título',
        'Nota Completa',
        'Link',
        'Reach',
        'Ad Value - Base',
        'Ad Value - 5',
        'Ad Value - 3',
        'Ad Value - 1,8',
        'Ad Value - 1',
      ],
      ...this.articles.map(a => [
        a.articleSource.country,
        a.articleSource.name,
        a.articleSource.category,
        a.articleSource.tier,
        a.title,
        a.text,
        'https://' + a.url,
        a.articleSource.reach,
        a.articleSource.adValueBase,
        a.articleSource.adValue500,
        a.articleSource.adValue300,
        a.articleSource.adValue180,
        a.articleSource.adValue100,
      ])
    ];

    const colsConfig: ColConfig[] = [
      { colInfo: { width: 20 } }, // País
      { colInfo: { width: 12 } }, // Medio
      { colInfo: { width: 12 } }, // Categoría
      { colInfo: { width: 8 } }, // Tier
      { colInfo: { width: 64 }, textWrap: true }, // Título
      { colInfo: { width: 64 }, textWrap: true }, // Nota Completa
      { colInfo: { width: 64 }, textWrap: true, hyperlink: true }, // Link
      { colInfo: { width: 15 } }, // Reach
      { colInfo: { width: 15 } }, // Ad Value - Base
      { colInfo: { width: 15 } }, // Ad Value - 5
      { colInfo: { width: 15 } }, // Ad Value - 3
      { colInfo: { width: 15 } }, // Ad Value - 1,8
      { colInfo: { width: 15 } }, // Ad Value - 1
    ];

    this.excelExport.export({
      moduleLabel: 'Keyword Search',
      fileName,
      data: [{
        name: 'Results',
        headerData: {
          'Monitoreo de Medios': '',
          'Período': period,
          'Universo': ''
        },
        bodyData: data
      }],
      colsConfig
    });
  }
}
