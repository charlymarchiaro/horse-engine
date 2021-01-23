import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchOverlayComponent } from './search-overlay.component';

describe('SearchOverlayComponent', () => {
  let component: SearchOverlayComponent;
  let fixture: ComponentFixture<SearchOverlayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchOverlayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
