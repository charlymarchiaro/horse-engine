import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';



export type NotificationType = 'info' | 'warning' | 'error';



@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent implements OnInit {

  public type: NotificationType;
  public title: string;
  public subTitle: string;
  public message: string;

  public icon: {
    name: string;
    style: { [key: string]: string };
  };


  constructor(
    private dialogRef: MatDialogRef<NotificationDialogComponent>,
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

      case 'error':
        this.icon = {
          name: 'error',
          style: { color: '#d82013' },
        };
        break;
    }
  }


  ngOnInit() {
  }


  public onOkButtonClick() {
    this.dialogRef.close();
  }
}
