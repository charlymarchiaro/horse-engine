import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ArticleFilteringScheme, ArticlePart, MatchCondition, ArticleFilteringCondition } from '../model';
import { isNullOrUndefined } from 'util';



@Component({
  selector: 'app-article-filtering-scheme-editor',
  templateUrl: './article-filtering-scheme-editor.component.html',
  styleUrls: ['./article-filtering-scheme-editor.component.scss']
})
export class ArticleFilteringSchemeEditorComponent implements OnInit {


  public isValid: boolean;


  public scheme: ArticleFilteringScheme;


  constructor(
    public dialogRef: MatDialogRef<ArticleFilteringSchemeEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      scheme: ArticleFilteringScheme
    }) {

    if (!!data.scheme) {

      this.scheme = data.scheme;

    } else {

      this.scheme = {
        conditions: [[this.getEmptyCondition()]],
      };
    }

    this.validate();
  }


  ngOnInit() {
  }


  public onAddAndClick(andGroupIndex: number) {
    this.scheme.conditions[andGroupIndex].push(this.getEmptyCondition());
    this.validate();
  }


  public onAddOrClick() {
    this.scheme.conditions.push([this.getEmptyCondition()]);
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


  private getEmptyCondition(): ArticleFilteringCondition {
    return {
      part: null,
      matchCondition: null,
      textToMatch: null,
      caseSensitive: true,
    };
  }
}
