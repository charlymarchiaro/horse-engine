import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatabaseQueryResultsComponent } from './database-query-results.component';

describe('DatabaseQueryResultsComponent', () => {
  let component: DatabaseQueryResultsComponent;
  let fixture: ComponentFixture<DatabaseQueryResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatabaseQueryResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseQueryResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
