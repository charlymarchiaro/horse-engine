import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsddSourceStatsComponent } from './psdd-source-stats.component';

describe('PsddSourceStatsComponent', () => {
  let component: PsddSourceStatsComponent;
  let fixture: ComponentFixture<PsddSourceStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsddSourceStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsddSourceStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
