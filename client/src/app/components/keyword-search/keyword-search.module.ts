import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './main.component';
import { ArticleFilteringSchemeEditorComponent } from './article-filtering-scheme-editor/article-filtering-scheme-editor.component';
import { ArticleFilteringConditionComponent } from './article-filtering-scheme-editor/article-filtering-condition/article-filtering-condition.component';
import { pgSelectModule } from '../../@pages/components/select/select.module';
import { TextMaskModule } from 'angular2-text-mask';
import { MaterialComponentsModule } from '../../material-components.module';
import { FilteringSchemePreviewComponent } from './filtering-scheme-preview/filtering-scheme-preview.component';
import { ArticlePreviewComponent } from './article-preview/article-preview.component';
import { ArticleListBrowserComponent } from './article-list-browser/article-list-browser.component';



@NgModule({
  declarations: [MainComponent, ArticleFilteringSchemeEditorComponent, ArticleFilteringConditionComponent, FilteringSchemePreviewComponent, ArticlePreviewComponent, ArticleListBrowserComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentsModule,
    pgSelectModule,
    TextMaskModule,
  ],
  exports: [
    MainComponent,
  ],
  entryComponents: [
    ArticleFilteringSchemeEditorComponent,
  ]
})
export class KeywordSearchModule { }
