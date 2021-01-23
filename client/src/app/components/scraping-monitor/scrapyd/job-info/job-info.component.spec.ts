import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JobInfoComponent } from './job-info.component';

describe('JobInfoComponent', () => {
  let component: JobInfoComponent;
  let fixture: ComponentFixture<JobInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ JobInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
