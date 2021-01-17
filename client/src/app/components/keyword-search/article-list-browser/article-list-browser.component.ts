import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Article } from '../../../model/article.model';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { ArticleFilteringScheme, DateSpan } from '../model';
import { ColInfo } from 'xlsx/types';
import { ExcelExportService, ColConfig } from '../../../services/utils/excel-export.service';



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
        'Tier',
        'Territorio',
        'Círculo Rojo',
        'Fecha',
        'Título',
        'Nota Completa',
        'Link',
        'Reach',
        'Ad Value - 5',
        'Ad Value - 1,5',
      ],
      ...this.articles.map(a => [
        a.articleSource.country,
        a.articleSource.name,
        a.articleSource.tier,
        a.articleSource.region,
        a.articleSource.redCircle ? 'SI' : 'NO',
        this.datePipe.transform(a.lastUpdated, 'dd/MM/yyyy HH:mm'),
        a.title,
        a.text,
        a.articleSource.url.split(':')[0] + '://' + a.url,
        a.articleSource.reach,
        a.articleSource.adValue500,
        a.articleSource.adValue150,
      ])
    ];

    const colsConfig: ColConfig[] = [
      { colInfo: { width: 20 } }, // País
      { colInfo: { width: 12 } }, // Medio
      { colInfo: { width: 8 } }, // Tier
      { colInfo: { width: 15 } }, // Territorio
      { colInfo: { width: 15 } }, // Círculo rojo
      { colInfo: { width: 20 } }, // Fecha
      { colInfo: { width: 64 }, textWrap: true }, // Título
      { colInfo: { width: 64 }, textWrap: true }, // Nota Completa
      { colInfo: { width: 64 }, textWrap: true, hyperlink: true }, // Link
      { colInfo: { width: 15 } }, // Reach
      { colInfo: { width: 15 } }, // Ad Value - 5
      { colInfo: { width: 15 } }, // Ad Value - 1,5
    ];

    this.excelExport.export({
      moduleLabel: 'Search',
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
