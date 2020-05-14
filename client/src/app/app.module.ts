import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePipe } from '@angular/common';
import { HelloComponent } from './hello/hello.component';
import { JobInfoComponent } from './scrapyd/job-info/job-info.component';
import { DatabaseQueryResultsComponent } from './scrapyd/database-query-results/database-query-results.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
    JobInfoComponent,
    DatabaseQueryResultsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
