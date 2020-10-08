import { Component, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import { RootLayout } from '../root/root.component';

@Component({
  selector: 'condensed-layout',
  templateUrl: './condensed.component.html',
  styleUrls: ['./condensed.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CondensedComponent extends RootLayout implements OnInit {
  menuLinks = [
    {
      label: 'Dashboard',
      routerLink: '/dashboard',
      iconType: 'pg',
      iconName: 'home'
    },
    {
      label: 'Scraping Monitor',
      routerLink: '/scraping-monitor',
      iconType: 'pg',
      iconName: 'card'
    },
    {
      label: 'Search',
      routerLink: '/search',
      iconType: 'pg',
      iconName: 'search'
    },
  ];

  ngOnInit() { }
}
