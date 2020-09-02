import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsrSourceStatsComponent } from './psr-source-stats.component';

describe('PsrSourceStatsComponent', () => {
  let component: PsrSourceStatsComponent;
  let fixture: ComponentFixture<PsrSourceStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsrSourceStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsrSourceStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
