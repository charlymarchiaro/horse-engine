import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuickviewComponent } from './quickview.component';

describe('QuickviewComponent', () => {
  let component: QuickviewComponent;
  let fixture: ComponentFixture<QuickviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuickviewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
