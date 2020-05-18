import {
  Component,
  OnInit,
  OnDestroy,
  AfterContentInit,
  AfterViewInit,
  Input,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  HostListener,
  ContentChild,
  TemplateRef
} from '@angular/core';

import { pagesToggleService } from '../../services/toggler.service';
declare var pg: any;
@Component({
  selector: 'pg-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: ['./horizontal-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HorizontalMenuComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  menuItems = [];
  _renduerMenuItems = [];
  _hideExtra = 0;
  _autoHideItems = true;
  currentItem = null;
  _horizontalMobileMenu = false;
  resizeId: any;
  _service;
  // Simple hack flag to check if its wrapped
  _wrapped = false;
  @ViewChild('menuItemsList', { static: true }) _menuItemsList: ElementRef;
  @ViewChild('menuWrapper', { static: true }) _menuWrapper: ElementRef;
  @ContentChild('mobileSidebarFooter', { static: true }) mobileSidebarFooter: TemplateRef<void>;

  constructor(private toggler: pagesToggleService) {
    this._service = this.toggler.mobileHorizontaMenu.subscribe(state => {
      this._horizontalMobileMenu = state;
      this.closeHorizontalMenu();
    });
  }

  @Input()
  set HideExtra(value) {
    this._hideExtra = value;
  }

  @Input()
  set AutoHideItems(value) {
    this._autoHideItems = value;
  }

  @Input()
  set Items(value) {
    this.menuItems = value;
    this._renduerMenuItems = this.menuItems.slice();
  }

  ngAfterContentInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (pg.isVisibleSm() || pg.isVisibleXs()) {
        return false;
      }
      this._onContentChanges();
    });
  }

  ngOnDestroy() {
    this._service.unsubscribe();
  }

  closeHorizontalMenu() {
    if (!this.currentItem) {
      return;
    }
    this.currentItem['open'] = false;
    this.currentItem['opening'] = false;
    this.currentItem['ghost'] = {
      visibility: 'hidden'
    };
  }

  toggleLink(event, item) {
    // Mobile
    if (pg.isVisibleSm() || pg.isVisibleXs()) {
      if (this.currentItem && this.currentItem !== item) {
        this.currentItem['mToggle'] = 'close';
      }
      this.currentItem = item;
      item.mToggle = item.mToggle === 'close' ? 'open' : 'close';
      return false;
    }

    // Desktop
    if (this.currentItem && this.currentItem !== item) {
      this.currentItem['open'] = false;
      this.currentItem['opening'] = false;
      this.currentItem['ghost'] = {
        visibility: 'hidden'
      };
    }
    this.currentItem = item;
    const elParent = event.currentTarget.parentNode;
    if (item['open']) {
      const el = elParent.querySelector('ul');
      const rect = el.getBoundingClientRect();
      item.ghost = {
        width: rect.width + 'px',
        height: 0,
        zIndex: 'auto'
      };
      item['open'] = false;
      setTimeout(() => {
        item['opening'] = false;
      }, 240);
    } else {
      item['open'] = true;
      setTimeout(() => {
        const el = elParent.querySelector('ul');
        const rect = el.getBoundingClientRect();
        item.ghost = {
          height: '0',
          width: rect.width + 'px',
          zIndex: 'auto'
        };
        item.ghost = {
          width: rect.width + 'px',
          height: rect.height + 'px',
          zIndex: 'auto'
        };

        setTimeout(() => {
          item['opening'] = true;
        }, 140);
      }, 0);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout(this.resizeId);
    this.resizeId = setTimeout(() => {
      if (pg.isVisibleSm() || pg.isVisibleXs()) {
        this._renduerMenuItems = this.menuItems.slice();
        return false;
      }
      this._onContentChanges();
    }, 140);
  }

  _onContentChanges() {
    // Cache User Items
    console.log(this._autoHideItems);
    if (this._autoHideItems === false) {

      return;
    }
    this._renduerMenuItems = this.menuItems.slice();
    console.log(this._renduerMenuItems);
    const children = this._menuItemsList.nativeElement.childNodes;
    let totalChildrenWidth = 0;
    let liCount = 0;
    for (let i = 0; i < children.length; i++) {
      if (children[i]['nodeName'] === 'LI') {
        totalChildrenWidth = totalChildrenWidth + children[i].offsetWidth;
        if (totalChildrenWidth > this._menuWrapper.nativeElement.offsetWidth) {
          this.wrap(liCount);
          break;
        }
        liCount++;
      }
    }

    // @TODO:Will Force Wrap
    if (!this._wrapped) {
      this.wrap(liCount);
    }
  }

  wrap(startIndex: number) {
    this._wrapped = true;
    startIndex--;
    startIndex = startIndex - this._hideExtra;
    const temp = {
      type: 'more',
      toggle: 'close',
      submenu: []
    };
    for (let i = startIndex; i < this._renduerMenuItems.length; i++) {
      temp['submenu'].push(this._renduerMenuItems[i]);
    }
    this._renduerMenuItems.splice(startIndex, this._renduerMenuItems.length);
    this._renduerMenuItems.push(temp);
  }

  toggleHorizontalMenu() {
    if (this._horizontalMobileMenu) {
      this._horizontalMobileMenu = false;
    } else {
      this._horizontalMobileMenu = true;
    }
    this.toggler.toggleMobileHorizontalMenu(this._horizontalMobileMenu);
  }
}
