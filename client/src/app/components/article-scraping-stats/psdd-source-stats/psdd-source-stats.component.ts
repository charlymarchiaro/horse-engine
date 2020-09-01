import { Component, OnInit } from '@angular/core';
import { MainService } from '../main.service';
import { LoadState, LoadStatus } from '../../../services/utils/load-status';
import { ArticleScrapingStatsFull } from '../../../model/article.model';


@Component({
  selector: 'app-article-psdd-source-stats',
  templateUrl: './psdd-source-stats.component.html',
  styleUrls: ['./psdd-source-stats.component.scss']
})
export class PsddSourceStatsComponent implements OnInit {


  public loadState: LoadState;
  public LoadStatus = LoadStatus;


  constructor(
    private mainService: MainService,
  ) {
    this.mainService.loadState$.subscribe(ls => this.loadState = ls);
    this.mainService.stats$.subscribe(s => this.onStatsChange(s));
  }


  ngOnInit() {
  }


  onRefresh() {
    this.mainService.requestData();
  }


  private onStatsChange(stats: ArticleScrapingStatsFull) {
    console.log(stats);
  }
}
