import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainService } from './main.service';
import { PsrSourceStatsComponent } from './psr-source-stats/psr-source-stats.component';
import { SscdSourceStatsComponent } from './sscd-source-stats/sscd-source-stats.component';
import { PsddSourceStatsComponent } from './psdd-source-stats/psdd-source-stats.component';
import { GlobalStatsComponent } from './global-stats/global-stats.component';
import { pgCardModule } from '../../@pages/components/card/card.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { MaterialComponentsModule } from '../../material-components.module';


@NgModule({
  declarations: [PsrSourceStatsComponent, SscdSourceStatsComponent, PsddSourceStatsComponent, GlobalStatsComponent],
  imports: [
    CommonModule,
    FormsModule,
    pgCardModule,
    NgxDatatableModule,
    MaterialComponentsModule,
  ],
  exports: [
    PsrSourceStatsComponent,
    SscdSourceStatsComponent,
    PsddSourceStatsComponent,
    GlobalStatsComponent,
  ],
  providers: [
    MainService,
  ]
})
export class ArticleScrapingStatsModule { }
