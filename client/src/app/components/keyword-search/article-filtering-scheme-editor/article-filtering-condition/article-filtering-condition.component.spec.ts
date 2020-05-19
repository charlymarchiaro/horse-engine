import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleFilteringConditionComponent } from './article-filtering-condition.component';

describe('ArticleFilteringConditionComponent', () => {
  let component: ArticleFilteringConditionComponent;
  let fixture: ComponentFixture<ArticleFilteringConditionComponent>;

  beforeEach(async(() => {
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
