import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatPaginatorGotoComponent } from './mat-paginator-goto.component';

describe('MatPaginatorGotoComponent', () => {
  let component: MatPaginatorGotoComponent;
  let fixture: ComponentFixture<MatPaginatorGotoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MatPaginatorGotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatPaginatorGotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
