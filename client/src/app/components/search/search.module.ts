import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { MainService } from './main.service';
import { SearchSchemeModule } from '../search-scheme/search-scheme.module';



@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    SearchSchemeModule
  ],
  exports: [
    MainComponent,
  ],
  providers: [
    MainService
  ]
})
export class SearchModule { }
