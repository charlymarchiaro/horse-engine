import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { ArticleFilteringSchemeEditorComponent } from './article-filtering-scheme-editor/article-filtering-scheme-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { ArticleFilteringScheme, ArticlePart, MatchCondition } from './model';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {


  public scheme: ArticleFilteringScheme;


  constructor(public dialog: MatDialog) { }


  ngOnInit() {
  }


  public onSubmitClick() {
    console.log(this.scheme)
  }


  public onEditFilteringSchemeClick() {
    this.showFilteringSchemeEditor();
  }


  public onClearFilteringSchemeClick() {
    this.scheme = null;
  }


  private showFilteringSchemeEditor() {
    const dialogRef = this.dialog.open(
      ArticleFilteringSchemeEditorComponent, {
      disableClose: true,
      data: {
        scheme: this.scheme
      }
    });

    dialogRef.afterClosed().subscribe(
      (result: ArticleFilteringScheme) => {
        if (!result) {
          return;
        }
        this.scheme = { ...result };
      }
    );
  }
}
