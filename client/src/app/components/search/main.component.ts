import { Component, OnInit } from '@angular/core';
import { SearchScheme } from '../../model/search-scheme.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {


  public selectedScheme: SearchScheme;


  constructor() { }


  ngOnInit() {
  }


  onSelectedSchemeChange(scheme: SearchScheme) {
    console.log(scheme);
    this.selectedScheme = scheme;
  }

}
