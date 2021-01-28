import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { ArticleScrapingStatsModule } from '../article-scraping-stats/article-scraping-stats.module';
import { pgCardModule } from '../../@pages/components/card/card.module';



const routes: Routes = [
  {
    path: '',
    component: MainComponent
  }
];


@NgModule({
  declarations: [MainComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    pgCardModule,
    ArticleScrapingStatsModule,
  ],
  exports: [
    RouterModule,
    MainComponent,
  ]
})
export class DashboardModule { }
