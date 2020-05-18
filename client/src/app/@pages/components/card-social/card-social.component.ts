import { Component, OnInit, HostBinding, Input, ViewEncapsulation, ElementRef, ViewChild, TemplateRef, ContentChild, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'pgcardsocial',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './card-social.component.html'
})


export class pgCardSocial implements OnInit{
  _title: string = '';
  _titleClass: string = 'text-complete';
  _type: string = 'text';
  _comments: string = '';
  _likes: string = '';
  _body: string = '';
  _timestamp: string = '';
  _source: string = '';
  _image: string = '';
  _author: string = '';
  _activity: string = '';
  _location: string = '';

  _additionalClasses = '';

  @ViewChild('hostContent', { static: false }) _hostContent: ElementRef;
  @ContentChild('CustomBody', { static: true }) CustomBody: TemplateRef<void>;
  @ContentChild('AuthorAvatar', { static: true }) AuthorAvatar: TemplateRef<void>;

  @HostBinding('class') classList = '';
  @Input() class: string;

  @Input()
  set Title(value: string) {
    this._title = value;
  }

  @Input()
  set TitleClass(value: string) {
    this._titleClass = value;
  }

  @Input()
  set Type(value: string) {
    this._type = value;
  }

  @Input()
  set Comments(value: string) {
    this._comments = value;
  }

  @Input()
  set Likes(value: string) {
    this._likes = value;
  }

  @Input()
  set Body(value: string) {
    this._body = value;
  }

  @Input()
  set Timestamp(value: string) {
    this._timestamp = value;
  }

  @Input()
  set Source(value: string) {
    this._source = value;
  }

  @Input()
  set Author(value: string) {
    this._author = value;
  }

  @Input()
  set Activity(value: string) {
    this._activity = value;
  }

  @Input()
  set Image(value: string) {
    this._image = value;
  }

  @Input()
  set Location(value: string) {
    this._location = value;
  }

  @Input()
  set AdditionalClasses(value: string) {
    this._additionalClasses = value;
  }

  ngOnInit() {
	if (this.class) {
	   this.classList += ' ' + this.class;
	}
   }
}
