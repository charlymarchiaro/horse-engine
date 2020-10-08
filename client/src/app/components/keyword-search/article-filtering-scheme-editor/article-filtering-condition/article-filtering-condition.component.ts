import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ArticleMatchCondition, ArticlePart, MatchCondition } from '../../model';


export interface ChangeEventArgs {
  condition: ArticleMatchCondition;
  isValid: boolean;
}


@Component({
  selector: 'app-article-filtering-condition',
  templateUrl: './article-filtering-condition.component.html',
  styleUrls: ['./article-filtering-condition.component.scss'],
})
export class ArticleFilteringConditionComponent implements OnInit, OnChanges {


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


  @Input() public condition: ArticleMatchCondition;
  @Input() public enableRemove: boolean = true;
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
    this.validate();
  }


  ngOnChanges(changes: SimpleChanges) {
    this.validate();
  }


  onChange() {
    this.validate();

    this.change.emit({
      condition: this.condition,
      isValid: this.isValid
    });
  }


  onRemoveClick() {
    this.remove.emit();
  }


  private validate() {
    this.isValid = (
      !!this.condition.part
      && !!this.condition.matchCondition
      && !!this.condition.textToMatch
      && this.condition.textToMatch !== ''
    );
  }
}
