import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor/editor.component';
import { SearchSchemeService } from './search-scheme.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserComponent } from './browser/browser.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { MaterialComponentsModule } from '../../material-components.module';
import { BrowserService } from './browser/browser.service';



@NgModule({
  declarations: [EditorComponent, BrowserComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    pgCardModule,
    NgxDatatableModule,
    MaterialComponentsModule,
  ],
  providers: [
    SearchSchemeService,
    BrowserService,
  ],
  exports: [
    EditorComponent,
    BrowserComponent,
  ],
})
export class SearchSchemeModule { }
