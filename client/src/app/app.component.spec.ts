import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HelloComponent } from './hello/hello.component';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { JobInfoComponent } from './scrapyd/job-info/job-info.component';
import { DatabaseQueryResultsComponent } from './scrapyd/database-query-results/database-query-results.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
      ],
      declarations: [
        AppComponent,
        HelloComponent,
        JobInfoComponent,
        DatabaseQueryResultsComponent,
      ],
      providers: [
        DatePipe,
      ]
    }).compileComponents();
  }));

  it(`should have as title 'client'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('client');
  });
});
