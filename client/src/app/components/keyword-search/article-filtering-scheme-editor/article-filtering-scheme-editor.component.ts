import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArticleFilteringScheme, ArticlePart, MatchCondition, ArticleFilteringCondition } from '../model';
import { isNullOrUndefined } from 'util';



const EMPTY_CONDITION: ArticleFilteringCondition = {
  part: null,
  matchCondition: null,
  textToMatch: null,
  caseSensitive: true,
};


@Component({
  selector: 'app-article-filtering-scheme-editor',
  templateUrl: './article-filtering-scheme-editor.component.html',
  styleUrls: ['./article-filtering-scheme-editor.component.scss']
})
export class ArticleFilteringSchemeEditorComponent implements OnInit {


  public isValid: boolean;


  @Input() public scheme: ArticleFilteringScheme;


  constructor(
    public dialogRef: MatDialogRef<ArticleFilteringSchemeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { a: string }) { }


  ngOnInit() {
    this.scheme = {
      conditions: [[EMPTY_CONDITION]],
      dateSpan: {
        fromDateIncl: null,
        toDateIncl: null,
      }
    };

    this.validate();
  }


  public onAddAndClick(andGroupIndex: number) {
    this.scheme.conditions[andGroupIndex].push(EMPTY_CONDITION);
    this.validate();
  }


  public onAddOrClick() {
    this.scheme.conditions.push([EMPTY_CONDITION]);
    this.validate();
  }


  public onRemoveClick(andGroupIndex: number, conditionIndex: number) {

    const andGroup = this.scheme.conditions[andGroupIndex];

    if (andGroup.length > 1) {
      // Not the only condition in the and-group --> remove from group
      this.scheme.conditions[andGroupIndex] = andGroup.filter(
        (c, index) => index !== conditionIndex
      );

    } else {

      // It's the only condition in the and-group --> remove the and-group
      this.scheme.conditions = this.scheme.conditions.filter(
        (c, index) => index !== andGroupIndex
      );
    }

    this.validate();
  }


  public onConditionChange() {
    this.validate();
  }


  private validate() {

    for (const andGroup of this.scheme.conditions) {
      for (const condition of andGroup) {
        if (
          isNullOrUndefined(condition.part)
          || isNullOrUndefined(condition.matchCondition)
          || isNullOrUndefined(condition.textToMatch)
          || condition.textToMatch === ''
        ) {
          this.isValid = false;
          return;
        }
      }
    }

    this.isValid = true;
  }

}
