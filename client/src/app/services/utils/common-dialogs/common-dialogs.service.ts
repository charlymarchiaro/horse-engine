import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ProgressDialogComponent, ProgressReturnCode } from '../../../components/shared/dialogs/progress-dialog/progress-dialog.component';
import { NotificationDialogComponent, NotificationType } from '../../../components/shared/dialogs/notification-dialog/notification-dialog.component';
import { ConfirmationDialogComponent, ConfirmationType, ConfirmationReturnCode } from '../../../components/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { TextInputDialogComponent, TextInputReturnCode, TextInputResponse } from '../../../components/shared/dialogs/text-input-dialog/text-input-dialog.component';





@Injectable({
  providedIn: 'root'
})
export class CommonDialogsService {

  private isProgressDialogOpen = false;
  private isNotificationDialogOpen = false;
  private isConfirmationDialogOpen = false;
  private isTextInputDialogOpen = false;

  private progressDialogRef: MatDialogRef<ProgressDialogComponent>;
  private notificationDialogRef: MatDialogRef<NotificationDialogComponent>;
  private confirmationDialogRef: MatDialogRef<ConfirmationDialogComponent>;
  private textInputDialogRef: MatDialogRef<TextInputDialogComponent>;


  constructor(
    private progressDialog: MatDialog,
    private notificationDialog: MatDialog,
    private confirmationDialog: MatDialog,
    private textInputDialog: MatDialog,
  ) { }


  public showProgressDialog(
    title: string,
    subTitle: string = null,
    message: string = null,
    cancelButton: boolean = true,
  ): Promise<ProgressReturnCode> {

    this.progressDialogRef = this.progressDialog.open(
      ProgressDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: {
          title,
          subTitle,
          message,
          cancelButton,
        }
      }
    );

    this.isProgressDialogOpen = true;

    return new Promise<ProgressReturnCode>(

      (resolve, reject) => {

        try {
          this.progressDialogRef.afterClosed().subscribe(
            (code: ProgressReturnCode) => {

              // Cancel by default if abnormally interrupted.
              code = !!code ? code : ProgressReturnCode.CANCEL;

              this.hideProgressDialog(code);

              resolve(code);
            }
          );

        } catch (e) {
          reject(e);
        }
      });
  }


  public showNotificationDialog(
    type: NotificationType,
    title: string,
    subTitle: string = null,
    message: string = null,
  ): Promise<void> {

    this.notificationDialogRef = this.notificationDialog.open(

      NotificationDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: {
          type,
          title,
          subTitle,
          message
        }
      }
    );

    this.isNotificationDialogOpen = true;

    return new Promise(

      (resolve, reject) => {

        try {

          this.notificationDialogRef.afterClosed().subscribe(
            () => {

              this.hideNotificationDialog();

              resolve();
            }
          );

        } catch (e) {
          reject(e);
        }
      });
  }


  public showConfirmationDialog(
    type: ConfirmationType,
    title: string,
    subTitle: string = null,
    message: string = null,
  ): Promise<ConfirmationReturnCode> {

    this.confirmationDialogRef = this.confirmationDialog.open(
      ConfirmationDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: {
          type,
          title,
          subTitle,
          message
        }
      }
    );

    this.isConfirmationDialogOpen = true;

    return new Promise<ConfirmationReturnCode>(

      (resolve, reject) => {

        try {

          this.confirmationDialogRef.afterClosed().subscribe(
            (code: ConfirmationReturnCode) => {

              // Cancel by default if abnormally interrupted.
              code = !!code ? code : ConfirmationReturnCode.CANCEL;

              this.hideConfirmationDialog(code);

              resolve(code);
            }
          );

        } catch (e) {
          reject(e);
        }
      });
  }


  public showTextInputDialog(
    title: string,
    subTitle: string = null,
    message: string = null,
    initialText: string = '',
    placeholder: string
  ): Promise<TextInputResponse> {

    this.textInputDialogRef = this.textInputDialog.open(
      TextInputDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: {
          title,
          subTitle,
          message,
          initialText,
          placeholder
        }
      }
    );

    this.isTextInputDialogOpen = true;

    return new Promise<TextInputResponse>(

      (resolve, reject) => {

        try {

          this.textInputDialogRef.afterClosed().subscribe(
            (response: TextInputResponse) => {

              // Cancel by default if abnormally interrupted.
              const code = !!response ? response.code : TextInputReturnCode.CANCEL;

              this.hideTextInputDialog(response);

              resolve({
                code,
                inputText: response.inputText
              });
            }
          );

        } catch (e) {
          reject(e);
        }
      });
  }


  public hideProgressDialog(code: ProgressReturnCode = ProgressReturnCode.FINISH) {
    if (this.isProgressDialogOpen === false) {
      return;
    }

    this.isProgressDialogOpen = false;
    this.progressDialogRef.close(code);
  }


  public hideNotificationDialog() {
    if (this.isNotificationDialogOpen === false) {
      return;
    }

    this.isNotificationDialogOpen = false;
    this.notificationDialogRef.close();
  }


  public hideConfirmationDialog(code: ConfirmationReturnCode = ConfirmationReturnCode.CANCEL) {
    if (this.isConfirmationDialogOpen === false) {
      return;
    }

    this.isConfirmationDialogOpen = false;
    this.confirmationDialogRef.close(code);
  }


  public hideTextInputDialog(response: TextInputResponse = null) {
    if (this.isTextInputDialogOpen === false) {
      return;
    }

    this.isTextInputDialogOpen = false;
    this.textInputDialogRef.close(response);
  }
}
