import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { JobInfoComponent } from './scrapyd/job-info/job-info.component';
import { DatabaseQueryResultsComponent } from './scrapyd/database-query-results/database-query-results.component';
import { MaterialComponentsModule } from '../../material-components.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MainComponent,
    JobInfoComponent,
    DatabaseQueryResultsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentsModule,
  ],
  exports: [
    MainComponent,
  ]
})
export class ScrapingMonitorModule { }
