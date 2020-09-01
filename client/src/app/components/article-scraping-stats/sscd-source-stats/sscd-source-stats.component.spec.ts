import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SscdSourceStatsComponent } from './sscd-source-stats.component';

describe('SscdSourceStatsComponent', () => {
  let component: SscdSourceStatsComponent;
  let fixture: ComponentFixture<SscdSourceStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SscdSourceStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SscdSourceStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
