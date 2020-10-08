import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchScheme } from '../../model/search-scheme.model';
import { pgCollapseComponent } from '../../@pages/components/collapse/collapse.component';
import { BrowserComponent } from '../search-scheme/browser/browser.component';
import { EditorComponent } from '../search-scheme/editor/editor.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {


  public selectedScheme: SearchScheme;
  public isEditionActive: boolean;


  @ViewChild('schemeBrowser', { static: false }) schemeBrowser: BrowserComponent;
  @ViewChild('schemeEditor', { static: false }) schemeEditor: EditorComponent;


  constructor() { }


  ngOnInit() {
  }


  onSelectedSchemeChange(scheme: SearchScheme) {
    this.selectedScheme = scheme;
  }


  onSchemeEditionActiveChange(value: boolean) {
    this.isEditionActive = value;
  }


  onSchemeEditorChange(event) {

  }


  onSchemeEditorClose() {
    this.schemeBrowser.setEditionActive(false);
  }
}
