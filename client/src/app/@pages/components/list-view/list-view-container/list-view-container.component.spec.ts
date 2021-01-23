import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListViewContainerComponent } from './list-view-container.component';

describe('ListViewContainerComponent', () => {
  let component: ListViewContainerComponent;
  let fixture: ComponentFixture<ListViewContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ListViewContainerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
