import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { SearchService } from './search.service';
import { SearchSchemeModule } from '../search-scheme/search-scheme.module';
import { LauncherComponent } from './launcher/launcher.component';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { MaterialComponentsModule } from '../../material-components.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [MainComponent, LauncherComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentsModule,
    pgCardModule,
    SearchSchemeModule
  ],
  exports: [
    MainComponent,
  ],
  providers: [
    SearchService
  ]
})
export class SearchModule { }
