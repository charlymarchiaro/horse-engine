import { Component, OnInit, ViewChild, Output, OnDestroy, EventEmitter } from '@angular/core';
import { SearchScheme, SearchSchemeKind } from '../../../model/search-scheme.model';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { SearchSchemeService } from '../search-scheme.service';
import { LoadState, LoadStatus } from '../../../services/utils/load-status';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-search-scheme-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit, OnDestroy {

  public loadState: LoadState;
  public LoadStatus = LoadStatus;

  public errorMessage: string;
  public isError: boolean;

  public selected: SearchScheme[] = [];
  public schemes: SearchScheme[];
  public visibleRows: SearchScheme[] = [];
  public sorts: { [field: string]: any }[];

  public searchKeyword: string;

  private subscription = new Subscription();


  @ViewChild(DatatableComponent, { static: true }) table: DatatableComponent;


  @Output() selectionChange = new EventEmitter<SearchScheme>();


  constructor(
    private searchSchemeService: SearchSchemeService,
    private snackBar: MatSnackBar,
  ) { }


  ngOnInit() {
    this.subscription.add(
      this.searchSchemeService.loadState$.subscribe(ls => this.loadState = ls)
    );
    this.subscription.add(
      this.searchSchemeService.schemes$.subscribe(s => this.onSchemesListChange(s))
    );

    this.sorts = [
      { prop: 'createdAt', dir: 'desc' },
    ];

    this.table.select.subscribe(
      () => this.emitSelectionChange()
    );

    this.updateSchemesList();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  onRefresh() {
    this.updateSchemesList();
  }


  private updateSchemesList() {

    this.isError = false;

    this.searchSchemeService.getAllSchemes().then(
      result => { },
      error => {
        this.errorMessage = error.message;
        this.isError = true;
      }
    );
  }


  private onSchemesListChange(schemes: SearchScheme[]) {
    this.schemes = schemes;

    if (!schemes) {
      return;
    }

    // Show a copy of the entire array
    this.visibleRows = [...this.schemes];

    this.searchKeyword = null;
  }


  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // Filter our data
    const temp = this.schemes.filter(function (s) {
      // Change the column name here
      // example d.places
      return s.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // Update the visible rows
    this.visibleRows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  onNewButtonClick() {

    this.isError = false;

    this.searchSchemeService.createEmptyScheme(SearchSchemeKind.article).then(
      result => {
        // Sort by creation time so that the new scheme appears on top
        this.sorts = [
          { prop: 'createdAt', dir: 'desc' },
        ];
        this.selected = [this.schemes.find(s => s.id === result.id)];
        this.emitSelectionChange();

        this.snackBar.open(
          `Search scheme created`,
          'Close',
          { duration: 3000 }
        );
      },
      error => {
        this.errorMessage = error.message;
        this.isError = true;
      }
    );
  }


  onMakeCopyButtonClick() {

    const selected = this.selected[0];
    this.isError = false;

    this.searchSchemeService.createSchemeCopy(selected).then(
      result => {
        // Sort by creation time so that the new scheme appears on top
        this.sorts = [
          { prop: 'createdAt', dir: 'desc' },
        ];
        this.selected = [this.schemes.find(s => s.id === result.id)];
        this.emitSelectionChange();

        this.snackBar.open(
          `Search scheme copy created`,
          'Close',
          { duration: 3000 }
        );
      },
      error => {
        this.errorMessage = error.message;
        this.isError = true;
      }
    );
  }


  onDeleteButtonClick() {

    const selected = this.selected[0];
    this.isError = false;

    this.searchSchemeService.deleteScheme(selected).then(
      result => {
        this.selected = [];
        this.emitSelectionChange();

        this.snackBar.open(
          `Search scheme deleted`,
          'Close',
          { duration: 3000 }
        );
      },
      error => {
        this.errorMessage = error.message;
        this.isError = true;
      }
    );
  }


  private emitSelectionChange() {
    this.selectionChange.emit(
      this.selected.length > 0 ? this.selected[0] : null
    );
  }
}
