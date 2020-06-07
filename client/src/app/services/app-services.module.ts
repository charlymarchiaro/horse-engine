import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BackendService } from './backend.service';
import { ExcelExportService } from './utils/excel-export.service';
import { CommonDialogsService } from './utils/common-dialogs/common-dialogs.service';
import { ClipboardService } from './utils/clipboard-service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    BackendService,
    ExcelExportService,
    CommonDialogsService,
    ClipboardService,
    DatePipe,
  ]
})
export class AppServicesModule { }
