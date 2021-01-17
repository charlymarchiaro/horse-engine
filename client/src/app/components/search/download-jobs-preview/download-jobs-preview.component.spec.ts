import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DownloadJobsPreviewComponent } from './download-jobs-preview.component';

describe('DownloadJobsPreviewComponent', () => {
  let component: DownloadJobsPreviewComponent;
  let fixture: ComponentFixture<DownloadJobsPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadJobsPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadJobsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
