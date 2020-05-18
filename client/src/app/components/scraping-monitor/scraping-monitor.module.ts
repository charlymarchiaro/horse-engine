import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './article-scraper-dashboard.ts/main.component';
import { JobInfoComponent } from './scrapyd/job-info/job-info.component';
import { DatabaseQueryResultsComponent } from './scrapyd/database-query-results/database-query-results.component';



@NgModule({
  declarations: [
    MainComponent,
    JobInfoComponent,
    DatabaseQueryResultsComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainComponent,
  ]
})
export class ScrapingMonitorModule { }
