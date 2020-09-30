import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './editor/editor.component';
import { SearchSchemeService } from './search-scheme.service';
import { FormsModule } from '@angular/forms';
import { BrowserComponent } from './browser/browser.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { MaterialComponentsModule } from '../../material-components.module';



@NgModule({
  declarations: [EditorComponent, BrowserComponent],
  imports: [
    CommonModule,
    FormsModule,
    pgCardModule,
    NgxDatatableModule,
    MaterialComponentsModule,
  ],
  providers: [
    SearchSchemeService
  ],
  exports: [
    EditorComponent,
    BrowserComponent,
  ],
})
export class SearchSchemeModule { }
