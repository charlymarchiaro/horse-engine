import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArticleFilteringConditionComponent } from './article-filtering-condition.component';

describe('ArticleFilteringConditionComponent', () => {
  let component: ArticleFilteringConditionComponent;
  let fixture: ComponentFixture<ArticleFilteringConditionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleFilteringConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleFilteringConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
