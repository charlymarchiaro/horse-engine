import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlankCorporateComponent } from './blank-corporate.component';

describe('BlankCorporateComponent', () => {
  let component: BlankCorporateComponent;
  let fixture: ComponentFixture<BlankCorporateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BlankCorporateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlankCorporateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
