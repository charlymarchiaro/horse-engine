import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialComponentsModule } from '../../../app/material-components.module';

import { ProgressDialogComponent } from './dialogs/progress-dialog/progress-dialog.component';
import { NotificationDialogComponent } from './dialogs/notification-dialog/notification-dialog.component';
import { ConfirmationDialogComponent } from './dialogs/confirmation-dialog/confirmation-dialog.component';
import { TextInputDialogComponent } from './dialogs/text-input-dialog/text-input-dialog.component';



@NgModule({
  declarations: [
    ProgressDialogComponent,
    NotificationDialogComponent,
    ConfirmationDialogComponent,
    TextInputDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialComponentsModule,
  ],
  exports: [
  ],
  entryComponents: [
    ProgressDialogComponent,
    NotificationDialogComponent,
    ConfirmationDialogComponent,
    TextInputDialogComponent,
  ]
})
export class SharedModule { }
