import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



export type ConfirmationType = 'info' | 'warning' | 'critical';


export enum ConfirmationReturnCode {
  CANCEL = 'cancel',
  ACCEPT = 'accept',
}


@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {


  public type: ConfirmationType;
  public title: string;
  public subTitle: string;
  public message: string;

  public icon: {
    name: string;
    style: { [key: string]: string };
  };


  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
  ) {

    this.type = data.type;
    this.title = data.title;
    this.subTitle = data.subTitle;
    this.message = data.message;

    switch (this.type) {

      case 'info':
        this.icon = {
          name: 'info',
          style: { color: '#288ffe' },
        };
        break;

      case 'warning':
        this.icon = {
          name: 'warning',
          style: { color: '#ffbe00' },
        };
        break;

      case 'critical':
        this.icon = {
          name: 'error',
          style: { color: '#d82013' },
        };
        break;
    }
  }


  ngOnInit() {
  }


  public onCancelButtonClick() {
    this.dialogRef.close(ConfirmationReturnCode.CANCEL);
  }


  public onAcceptButtonClick() {
    this.dialogRef.close(ConfirmationReturnCode.ACCEPT);
  }

}
