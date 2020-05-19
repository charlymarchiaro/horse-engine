import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ArticleFilteringCondition, ArticlePart, MatchCondition } from '../../model';


export interface ChangeEventArgs {
  condition: ArticleFilteringCondition;
  isValid: boolean;
}


@Component({
  selector: 'app-article-filtering-condition',
  templateUrl: './article-filtering-condition.component.html',
  styleUrls: ['./article-filtering-condition.component.scss'],
})
export class ArticleFilteringConditionComponent implements OnInit {


  public articlePartOptions: {
    label: string;
    value: ArticlePart;
    disabled: boolean;
  }[] = [
      { label: 'Text', value: ArticlePart.text, disabled: false },
      { label: 'Title', value: ArticlePart.title, disabled: false },
      { label: 'URL', value: ArticlePart.url, disabled: false },
    ];


  public matchConditionOptions: {
    label: string;
    value: MatchCondition;
    disabled: boolean;
  }[] = [
      { label: 'Contains', value: MatchCondition.contains, disabled: false },
      { label: 'Not contains', value: MatchCondition.notContains, disabled: false },
    ];


  public isValid: boolean;


  @Input() public condition: ArticleFilteringCondition;
  @Output() public remove = new EventEmitter();
  @Output() public change = new EventEmitter<ChangeEventArgs>();


  constructor() {
    this.condition = {
      part: null,
      matchCondition: null,
      textToMatch: null,
      caseSensitive: true,
    };
  }


  ngOnInit() {

  }


  onChange() {
    this.validate();

    this.change.emit({
      condition: this.condition,
      isValid: this.isValid
    });
    console.log({
      condition: this.condition,
      isValid: this.isValid
    })
  }


  onRemoveClick() {
    this.remove.emit();
  }


  private validate() {
    this.isValid = (
      !!this.condition.part
      && !!this.condition.matchCondition
      && !!this.condition.textToMatch
    );
  }
}
