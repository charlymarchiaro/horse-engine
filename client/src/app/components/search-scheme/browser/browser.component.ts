import { Component, OnInit, ViewChild, Output, OnDestroy, EventEmitter } from '@angular/core';
import { SearchScheme, SearchSchemeKind } from '../../../model/search-scheme.model';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription, BehaviorSubject } from 'rxjs';
import { SearchSchemeService } from '../search-scheme.service';
import { LoadState, LoadStatus } from '../../../services/utils/load-status';
import { MatSnackBar } from '@angular/material';
import { normalizeString } from '../../../services/utils/utils';
import { SearchService } from '../../search/search.service';
import { SearchState } from '../../../model/search.model';
import { CommonDialogsService } from '../../../services/utils/common-dialogs/common-dialogs.service';
import { ConfirmationReturnCode } from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { pgCard } from '../../../@pages/components/card/card.component';
import { BrowserService } from './browser.service';
import { filter } from 'rxjs/operators';

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

  public searchState: SearchState;
  public isDisabled = false;
  public isCollapsed = false;


  private subscription = new Subscription();


  @ViewChild(pgCard, { static: true }) pgCard: pgCard;
  @ViewChild(DatatableComponent, { static: true }) table: DatatableComponent;


  @Output() selectionChange = new EventEmitter<SearchScheme>();

  // Edition active
  private isEditionActiveSubject = new BehaviorSubject<boolean>(false);
  public isEditionActive = this.isEditionActiveSubject.getValue();
  @Output() isEditionActive$ = this.isEditionActiveSubject.asObservable();


  constructor(
    private searchSchemeService: SearchSchemeService,
    private searchService: SearchService,
    private browserService: BrowserService,
    private snackBar: MatSnackBar,
    private commonDialogsService: CommonDialogsService,
  ) { }


  ngOnInit() {
    this.subscription.add(
      this.searchSchemeService.loadState$.subscribe(ls => this.loadState = ls)
    );
    this.subscription.add(
      this.searchSchemeService.schemes$.subscribe(s => this.onSchemesListChange(s))
    );
    this.subscription.add(
      this.searchService.searchParams$.pipe(
        filter(p => !!p && !!p.scheme)
      ).subscribe(p => {
        this.selected = [this.schemes.find(s => s.id === p.scheme.id)];
      })
    );
    this.subscription.add(
      this.searchService.searchState$.subscribe(s => {
        this.searchState = s;
        this.updateIsDisabled();
      })
    );
    this.subscription.add(
      this.browserService.collapsed$.subscribe(c => this.pgCard.setCollapsed(c))
    );
    this.pgCard.toggled.subscribe(c => this.browserService.setCollapsed(c));

    this.sorts = [
      { prop: 'updatedAt', dir: 'desc' },
    ];

    this.table.select.subscribe(
      () => this.emitSelectionChange()
    );

    this.updateSchemesList();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.snackBar.ngOnDestroy();
  }


  public setEditionActive(value: boolean) {
    if (this.isEditionActiveSubject.getValue() === value) {
      return;
    }

    this.isEditionActiveSubject.next(value);
    this.isEditionActive = value;
  }


  public refresh() {
    this.updateSchemesList();
  }


  public onTableSelectionChange() {
    this.searchService.setSelectedScheme(this.selected[0]);
  }


  private updateIsDisabled() {
    this.isDisabled = this.searchState !== SearchState.idle;
  }


  private updateSchemesList() {

    this.isError = false;

    this.searchSchemeService.getAllSchemes().then(
      result => {
      },
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

    // Update selected scheme, keeping the same id
    if (this.selected && this.selected.length > 0 && this.selected[0]) {
      const match = schemes.find(s => s.id === this.selected[0].id);
      this.selected = match ? [match] : [];

    } else {
      // None selected, select the newset if there are any
      this.selected = schemes.length > 0
        ? [
          schemes.sort((a, b) =>
            a.updatedAt.getTime() < b.updatedAt.getTime() ? 1 : -1
          )[0]
        ]
        : [];
    }

    // Show a copy of the entire array
    this.visibleRows = [...this.schemes];

    this.searchKeyword = null;

    this.emitSelectionChange();
  }


  updateFilter(event) {
    const val = normalizeString(event.target.value.toLowerCase());

    // Filter our data
    const temp = this.schemes.filter(function (s) {
      return (
        normalizeString(s.name).toLowerCase().indexOf(val) !== -1
        || normalizeString(s.description).toLowerCase().indexOf(val) !== -1
        || !val
      );
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
          { prop: 'updatedAt', dir: 'desc' },
        ];
        this.selected = [this.schemes.find(s => s.id === result.id)];
        this.emitSelectionChange();
        this.setEditionActive(true);

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
          { prop: 'updatedAt', dir: 'desc' },
        ];
        this.selected = [this.schemes.find(s => s.id === result.id)];
        this.emitSelectionChange();
        this.setEditionActive(true);

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

    this.commonDialogsService.showConfirmationDialog(
      'warning',
      'Delete scheme',
      'Search scheme browser',
      `Are you sure you want to delete the search scheme '${selected.name}'?`
    )
      .then(
        code => {
          if (code === ConfirmationReturnCode.ACCEPT) {

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
        }
      );
  }


  private emitSelectionChange() {
    this.selectionChange.emit(
      this.selected.length > 0 ? this.selected[0] : null
    );
  }
}
