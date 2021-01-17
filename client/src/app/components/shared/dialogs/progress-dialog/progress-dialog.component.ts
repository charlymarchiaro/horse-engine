import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export enum ProgressReturnCode {
  CANCEL = 'cancel',
  FINISH = 'finish',
}



@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent implements OnInit {

  public title: string;
  public subTitle: string;
  public message: string;
  public showCancelButton: boolean;

  public icon: {
    name: string;
    style: { [key: string]: string };
  };


  constructor(
    private dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
  ) {

    this.title = data.title;
    this.subTitle = data.subTitle;
    this.message = data.message;
    this.showCancelButton = !!data.cancelButton;

    this.icon = {
      name: 'update',
      style: { color: '#288ffe' },
    };
  }


  ngOnInit() {
  }


  public onCancelButtonClick() {
    this.dialogRef.close(ProgressReturnCode.CANCEL);
  }
}
