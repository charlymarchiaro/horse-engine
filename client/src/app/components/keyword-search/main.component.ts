import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { ArticleFilteringSchemeEditorComponent } from './article-filtering-scheme-editor/article-filtering-scheme-editor.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    const dialogRef = this.dialog.open(
      ArticleFilteringSchemeEditorComponent, {
      disableClose: true,
      data: {
        a: '1111'
      }
    });
  }


  openModalWithComponent() {
    const dialogRef = this.dialog.open(
      ArticleFilteringSchemeEditorComponent, {
      disableClose: true,
      data: {
        a: '1111'
      }
    });
  }
}
