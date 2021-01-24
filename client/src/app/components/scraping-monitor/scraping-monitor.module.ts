import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { JobInfoComponent } from './scrapyd/job-info/job-info.component';
import { DatabaseQueryResultsComponent } from './scrapyd/database-query-results/database-query-results.component';
import { MaterialComponentsModule } from '../../material-components.module';
import { FormsModule } from '@angular/forms';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { NgxJsonViewerModule } from 'ngx-json-viewer';



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
    pgCardModule,
    NgxJsonViewerModule,
  ],
  exports: [
    MainComponent,
  ]
})
export class ScrapingMonitorModule { }
