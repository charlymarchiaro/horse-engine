import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { SearchService } from './search.service';
import { SearchSchemeModule } from '../search-scheme/search-scheme.module';
import { LauncherComponent } from './launcher/launcher.component';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { MaterialComponentsModule } from '../../material-components.module';
import { FormsModule } from '@angular/forms';
import { ResultsComponent } from './results/results.component';
import { ResultsListComponent } from './results-list/results-list.component';
import { DocumentPreviewComponent } from './document-preview/document-preview.component';
import { ResultsListService } from './results-list/results-list.service';
import { DirectivesModule } from '../../directives/directives.module';
import { SharedModule } from '../shared/shared.module';
import { ResultsDownloaderService } from './results-downloader/results-downloader.service';
import { DownloadJobsPreviewComponent } from './download-jobs-preview/download-jobs-preview.component';



const routes: Routes = [
  {
    path: '',
    component: MainComponent
  }
];



@NgModule({
  declarations: [MainComponent, LauncherComponent, ResultsComponent, ResultsListComponent, DocumentPreviewComponent, DownloadJobsPreviewComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FormsModule,
    MaterialComponentsModule,
    pgCardModule,
    SearchSchemeModule,
    DirectivesModule,
  ],
  exports: [
    RouterModule,
    MainComponent,
  ],
  providers: [
    SearchService,
    ResultsListService,
    ResultsDownloaderService,
  ]
})
export class SearchModule { }
