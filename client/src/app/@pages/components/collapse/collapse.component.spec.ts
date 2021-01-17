import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NzCollapseComponent } from './collapse.component';
import { NzCollapsesetComponent } from './collapseset.component';

describe('My First Test', () => {
  it('should get "Hello Taobao"', () => null);
});

describe('NzCollapsesetComponent', () => {
  let component: NzCollapsesetComponent;
  let fixture: ComponentFixture<NzCollapsesetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NzCollapseComponent, NzCollapsesetComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NzCollapsesetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('测试input - accordion : string', () => {
    component.nzAccordion = true;
    fixture.detectChanges();
    // expect(a).toEqual(b);
  });
});
