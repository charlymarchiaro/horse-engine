import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { JobInfoComponent } from './scrapyd/job-info/job-info.component';
import { DatabaseQueryResultsComponent } from './scrapyd/database-query-results/database-query-results.component';
import { MaterialComponentsModule } from '../../material-components.module';
import { FormsModule } from '@angular/forms';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { NgxJsonViewerModule } from 'ngx-json-viewer';



const routes: Routes = [
  {
    path: '',
    component: MainComponent
  }
];


@NgModule({
  declarations: [
    MainComponent,
    JobInfoComponent,
    DatabaseQueryResultsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    MaterialComponentsModule,
    pgCardModule,
    NgxJsonViewerModule,
  ],
  exports: [
    RouterModule,
    MainComponent,
  ]
})
export class ScrapingMonitorModule { }
