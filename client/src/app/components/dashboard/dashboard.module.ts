import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { ArticleScrapingStatsModule } from '../article-scraping-stats/article-scraping-stats.module';
import { pgCardModule } from '../../@pages/components/card/card.module';



@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    pgCardModule,
    ArticleScrapingStatsModule,
  ],
  exports: [
    MainComponent,
  ]
})
export class DashboardModule { }
