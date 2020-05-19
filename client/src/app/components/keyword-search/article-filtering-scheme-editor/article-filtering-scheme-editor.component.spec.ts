import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleFilteringSchemeEditorComponent } from './article-filtering-scheme-editor.component';

describe('ArticleFilteringSchemeEditorComponent', () => {
  let component: ArticleFilteringSchemeEditorComponent;
  let fixture: ComponentFixture<ArticleFilteringSchemeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleFilteringSchemeEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleFilteringSchemeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
