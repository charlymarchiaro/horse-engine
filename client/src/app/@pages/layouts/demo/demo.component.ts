import { Component, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'demo-layout',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
//This is a demo layout
export class DemoComponent implements OnInit {
  @ViewChild('root', { static: false }) root;
  constructor() {}

  ngOnInit() {}
}
