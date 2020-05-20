import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ArticleFilteringScheme } from '../model';
import { getArticleFilteringSchemeString } from '../utils';

@Component({
  selector: 'app-filtering-scheme-preview',
  templateUrl: './filtering-scheme-preview.component.html',
  styleUrls: ['./filtering-scheme-preview.component.scss']
})
export class FilteringSchemePreviewComponent implements OnInit, OnChanges {


  public schemeString: string;


  @Input() public scheme: ArticleFilteringScheme;

  @Output() public submit = new EventEmitter();
  @Output() public edit = new EventEmitter();
  @Output() public clear = new EventEmitter();


  constructor() { }


  ngOnInit() {
    this.updateSchemeString();
  }


  ngOnChanges(changes: SimpleChanges) {
    this.updateSchemeString();
  }


  public onSubmitClick() {
    this.submit.emit();
  }


  public onEditClick() {
    this.edit.emit();
  }


  public onClearClick() {
    this.clear.emit();
  }


  private updateSchemeString() {
    if (!this.scheme) {
      this.schemeString = null;
      return;
    }

    const str = getArticleFilteringSchemeString(this.scheme);
    this.schemeString = str.split('\n').join('<br>');
  }
}
