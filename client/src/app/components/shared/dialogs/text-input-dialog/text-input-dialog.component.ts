import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export enum TextInputReturnCode {
  CANCEL = 'cancel',
  ACCEPT = 'accept',
}


export interface TextInputResponse {
  code: TextInputReturnCode;
  inputText: string;
}


@Component({
  selector: 'app-text-input-dialog',
  templateUrl: './text-input-dialog.component.html',
  styleUrls: ['./text-input-dialog.component.scss']
})
export class TextInputDialogComponent implements OnInit {


  public title: string;
  public subTitle: string;
  public message: string;
  public placeholder: string;

  public icon: {
    name: string;
    style: { [key: string]: string };
  };


  public inputText: string;


  constructor(
    private dialogRef: MatDialogRef<TextInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data,
  ) {

    this.title = data.title;
    this.subTitle = data.subTitle;
    this.message = data.message;
    this.inputText = data.initialText;
    this.placeholder = data.placeholder;

    this.icon = {
      name: 'input',
      style: { color: '#288ffe' },
    };
  }


  ngOnInit() {
  }


  public onCancelButtonClick() {

    const response: TextInputResponse = {
      code: TextInputReturnCode.CANCEL,
      inputText: null
    };

    this.dialogRef.close(response);
  }


  public onAcceptButtonClick() {

    const response: TextInputResponse = {
      code: TextInputReturnCode.ACCEPT,
      inputText: this.inputText
    };

    this.dialogRef.close(response);
  }

}
