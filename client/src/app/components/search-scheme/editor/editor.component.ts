import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { SearchScheme, SearchSchemeKind, ArticleSearchSchemeImpl, ArticlePart, MatchCondition, ArticleMatchCondition, MatchConditionInfo, ArticlePartInfo, SecondaryConditionFieldInfo, SecondaryConditionInfo, ArticleSecondaryMatchCondition, SecondaryConditionField } from '../../../model/search-scheme.model';
import { Subscription } from 'rxjs';
import { SearchSchemeService } from '../search-scheme.service';
import { AbstractControl, FormBuilder, FormGroup, FormArray, ValidationErrors, Validators, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatSnackBar } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map, filter } from 'rxjs/operators';
import { normalizeString, onlyUnique } from '../../../services/utils/utils';
import { ArticleSource } from '../../../model/article.model';
import { isArray, isNullOrUndefined } from 'util';
import { SearchState } from '../../../model/search.model';
import { SearchService } from '../../search/search.service';


@Component({
  selector: 'app-search-scheme-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges {

  public errorMessage: string;
  public isError: boolean;

  public schemes: SearchScheme[];
  public sources: ArticleSource[] = [];

  public isSchemeSelected: boolean;
  public currentScheme: SearchScheme;

  public searchState: SearchState;
  public isDisabled = false;

  private subscription = new Subscription();


  @Input() selectedSchemeId: string;
  @Input() selectedSchemeKind: SearchSchemeKind;
  @Output() close = new EventEmitter();


  public form: FormGroup;

  public keepOpen: boolean;

  // Aux array to store each secondary condition params list
  public secCondParams: string[][] = [];
  public visibleSecCondParamOptions: string[][] = [];

  public secCondParamOptions: { [field in SecondaryConditionField]?: any[] };

  public titleMatchKeywordsList: string[] = [];

  public articlePartInfo = Object.values(ArticlePartInfo);
  public matchCondInfo = Object.values(MatchConditionInfo);
  public secCondFieldInfo = Object.values(SecondaryConditionFieldInfo);
  public secCondInfo = Object.values(SecondaryConditionInfo);
  public secCondInfoDict = SecondaryConditionInfo;

  public separatorKeysCodes: number[] = [ENTER, COMMA];

  get name() { return this.form.get('name') as FormControl; }
  get description() { return this.form.get('description') as FormControl; }
  get matchConditions() { return this.form.get('matchConditions') as FormGroup; }
  get secondaryMatchConditions() { return this.form.get('secondaryMatchConditions') as FormArray; }
  get titleMatchKeywords() { return this.form.get('titleMatchKeywords') as FormControl; }

  public asFormArray(val): FormArray { return (val as FormArray); }




  constructor(
    private searchSchemeService: SearchSchemeService,
    private searchService: SearchService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    searchSchemeService.articleSources.subscribe(
      sources => this.onArticleSourcesRefresh(sources)
    );

    this.resetForm();
  }


  ngOnInit() {
    this.subscription.add(
      this.searchSchemeService.schemes$.subscribe(s => this.onSchemesListChange(s))
    );
    this.subscription.add(
      this.searchSchemeService.keepEditorOpen$.subscribe(v => this.keepOpen = v)
    );
    this.subscription.add(
      this.searchService.searchState$.subscribe(s => {
        this.searchState = s;
        this.updateIsDisabled();
      })
    );
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.snackBar.ngOnDestroy();
  }


  ngOnChanges(changes: SimpleChanges) {
    this.initForm();
  }


  onArticleSourcesRefresh(sources: ArticleSource[]) {
    this.sources = sources;
    this.updateSecCondParamOptions();
  }


  private updateIsDisabled() {
    this.isDisabled = this.searchState !== SearchState.idle;
  }


  /**
   * Template event handlers -----------------------------------------------------
   */


  onRemovePrimaryConditionClick(andGroupIndex: number, conditionIndex: number) {
    this.removeMatchCond(andGroupIndex, conditionIndex);
    this.form.markAsDirty();
  }

  onAddPrimaryConditionClick(andGroupIndex: number) {
    this.addMatchCond(andGroupIndex);
    this.form.markAsDirty();
  }

  onAddPrimaryConditionAndGroupClick() {
    this.addMatchCondAndGroup();
    this.form.markAsDirty();
  }

  onAddSecondaryConditionClick() {
    this.addSecCond();
    this.form.markAsDirty();

  }

  onRemoveSecondaryConditionClick(conditionIndex: number) {
    this.removeSecCond(conditionIndex);
    this.form.markAsDirty();
  }

  onSecondaryConditionChange(conditionIndex) {
    this.resetSecCondParams(conditionIndex);
    this.updateVisibleSecCondParamsOptions(conditionIndex);
    this.form.markAsDirty();
  }

  onAddSecondaryConditionParam(conditionIndex: number, event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    // Add item
    if ((value || '').trim()) {
      this.addSecCondParam(conditionIndex, value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.secondaryMatchConditions.at(conditionIndex)
      .get('params').setValue(null);

    this.updateVisibleSecCondParamsOptions(conditionIndex);
    this.form.markAsDirty();
  }

  onSelectSecondaryConditionParamAuto(
    conditionIndex: number,
    event: MatAutocompleteSelectedEvent,
    input: HTMLInputElement
  ) {
    const value = event.option.viewValue;

    this.addSecCondParam(conditionIndex, value);

    // Reset the input value
    input.value = '';

    this.secondaryMatchConditions.at(conditionIndex)
      .get('params').setValue(null);

    this.updateVisibleSecCondParamsOptions(conditionIndex);
    this.form.markAsDirty();
  }


  onSingleSecondaryConditionParamChange(conditionIndex: number, value: string) {
    this.secCondParams[conditionIndex] = [value];
    this.form.markAsDirty();
  }


  onRemoveSecondaryConditionParam(conditionIndex: number, itemIndex: number) {
    this.removeSecCondParam(conditionIndex, itemIndex);
    this.form.markAsDirty();
  }

  onParamsInputChange(conditionIndex: number, $event) {
    this.updateVisibleSecCondParamsOptions(conditionIndex);
    this.form.markAsDirty();
  }

  onAddTitleMatchKeyword(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    // Add item
    if ((value || '').trim()) {
      this.addTitleMatchKeywordItem(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.titleMatchKeywords.setValue(null);
    this.form.markAsDirty();
  }

  onRemoveTitleMatchKeyword(itemIndex: number) {
    this.removeTitleMatchKeywordItem(itemIndex);
    this.form.markAsDirty();
  }

  onCancelClick() {
    this.cancel();

    if (!this.keepOpen) {
      this.emitCloseEvent();
    }
  }

  onSaveClick() {
    if (!this.keepOpen) {
      this.emitCloseEvent();
    }
  }

  onKeepOpenChange(value: boolean) {
    this.searchSchemeService.setKeepEditorOpen(value);
  }

  // ---------------------------------------------------------------------------

  private onSchemesListChange(schemes: SearchScheme[]) {
    this.schemes = schemes;
    this.initForm();
  }


  private resetForm() {
    this.form = this.fb.group({
      // name
      name: ['', {
        validators: [
          Validators.required,
          Validators.maxLength(255),
          this.uniqueNameValidator(this)
        ],
        updateOn: 'change'
      }],
      // description
      description: ['', {
        validators: [],
        updateOn: 'change'
      }],
      // matchConditions
      matchConditions: this.fb.group({
        or: this.fb.array([])
      }),
      // secondaryMatchConditions
      secondaryMatchConditions: this.fb.array([]),
      // titleMatchKeywords
      titleMatchKeywords: ['', {
        validators: [],
        updateOn: 'change'
      }]
    });

    this.secCondParams = [];
    this.visibleSecCondParamOptions = [];

    this.titleMatchKeywordsList = [];
  }


  private initForm() {
    this.isSchemeSelected = false;

    this.currentScheme = this.schemes
      ? this.schemes.find(s =>
        s.id === this.selectedSchemeId
        && s.kind === this.selectedSchemeKind
      )
      : null;

    if (!this.currentScheme) {
      return;
    }

    this.isSchemeSelected = true;

    // Reset form
    this.resetForm();

    // name
    this.name.setValue(this.currentScheme.name);

    // description
    this.description.setValue(this.currentScheme.description);

    // matchConditions
    if (
      this.currentScheme.scheme.matchConditions.or.length === 0
      || this.currentScheme.scheme.matchConditions.or[0].and.length === 0
    ) {
      // No conditions defined --> add a default one
      this.addMatchCondAndGroup();

    } else {
      // There are conditions defined --> init form
      this.currentScheme.scheme.matchConditions.or.forEach(
        (andGroup, andGroupIndex) => {
          this.addMatchCondAndGroup({ empty: true });

          andGroup.and.forEach(
            (condition, conditionIndex) => {
              this.addMatchCond(andGroupIndex, condition);
            }
          );
        }
      );
    }

    // secondaryMatchConditions
    this.currentScheme.scheme.secondaryMatchConditions.forEach(
      condition => this.addSecCond(condition)
    );

    // titleMatchKeywords
    this.titleMatchKeywordsList = this.currentScheme.scheme.titleMatchKeywords || [];
  }


  submitForm() {
    this.isError = false;

    const scheme: ArticleSearchSchemeImpl = {
      matchConditions: {
        or: this.matchConditions.value.or,
      },
      secondaryMatchConditions:
        (this.secondaryMatchConditions.value as ArticleSecondaryMatchCondition[])
          .map((v, i) => ({
            field: v.field,
            condition: v.condition,
            params: this.secCondParams[i],
          })),
      titleMatchKeywords: this.titleMatchKeywordsList,
    };

    this.searchSchemeService.updateScheme(
      new SearchScheme(
        {
          id: this.selectedSchemeId,
          name: this.form.value.name,
          description: this.form.value.description,
          version: '1',
          scheme,
          enabled: !this.form.invalid
        },
        this.selectedSchemeKind
      )
    ).then(
      result => {
        this.snackBar.open(
          `Search scheme saved`,
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


  private cancel() {
    if (!this.currentScheme) {
      return;
    }

    if (this.currentScheme.enabled) {
      this.searchSchemeService.getAllSchemes();
    } else {
      this.searchSchemeService.deleteScheme(this.currentScheme);
    }
  }

  // ---------------------------------------------------------------------------


  private addMatchCond(andGroupIndex: number, condition?: ArticleMatchCondition) {
    const part = condition ? condition.part : '';
    const matchCondition = condition ? condition.matchCondition : '';
    const textToMatch = condition ? condition.textToMatch : '';
    const caseSensitive = condition ? condition.caseSensitive : false;

    const or = (this.matchConditions.get('or') as FormArray);
    const and = (or.at(andGroupIndex).get('and') as FormArray);

    const conditionGroup = this.fb.group({
      part: [part, { validators: [this.articlePartValidator], updateOn: 'change' }],
      matchCondition: [matchCondition, { validators: [this.matchCondValidator], updateOn: 'change' }],
      textToMatch: [textToMatch, { validators: [Validators.required], updateOn: 'change' }],
      caseSensitive: [caseSensitive, { validators: [], updateOn: 'change' }],
    });

    and.push(conditionGroup);
  }


  private removeMatchCond(andGroupIndex: number, conditionIndex: number) {
    const or = (this.matchConditions.get('or') as FormArray);
    const and = (or.at(andGroupIndex).get('and') as FormArray);

    and.removeAt(conditionIndex);

    if (and.length === 0) {
      // No conditions left, remove and group
      this.removeMatchCondAndGroup(andGroupIndex);
    }
  }


  private addMatchCondAndGroup(
    options: { empty: boolean } = {
      empty: false
    }
  ) {
    const or = (this.matchConditions.get('or') as FormArray);

    or.push(
      this.fb.group({
        and: this.fb.array([])
      })
    );

    if (!options.empty) {
      // Add default condition to the new and group
      this.addMatchCond(or.length - 1);
    }
  }


  private removeMatchCondAndGroup(andGroupIndex: number) {
    const or = (this.matchConditions.get('or') as FormArray);
    or.removeAt(andGroupIndex);

    if (or.length === 0) {
      // No conditions, create an empty one
      this.addMatchCondAndGroup();
    }
  }


  private addSecCond(condition?: ArticleSecondaryMatchCondition) {
    const field = condition ? condition.field : '';
    const secCondition = condition ? condition.condition : '';

    // Init the form control only when it is a single value field
    const params = (
      condition
      && secCondition
      && this.secCondInfoDict[secCondition].options.numberOfParams === 1
    ) ? condition.params[0] : '';

    const conditionGroup = this.fb.group({
      field: [field, { validators: [Validators.required], updateOn: 'change' }],
      condition: [secCondition, { validators: [Validators.required], updateOn: 'change' }],
      params: [params, { validators: [], updateOn: 'change' }]
    });

    this.secondaryMatchConditions.push(conditionGroup);
    this.secCondParams.push(condition ? condition.params : []);

    this.updateVisibleSecCondParamsOptions(
      this.secCondParams.length - 1
    );
  }


  private removeSecCond(conditionIndex: number) {
    this.secondaryMatchConditions.removeAt(conditionIndex);

    this.secCondParams = (
      this.secCondParams
        .filter((p, i) => i !== conditionIndex)
    );
  }


  private resetSecCondParams(conditionIndex: number) {
    this.secCondParams[conditionIndex] = [];
    this.secondaryMatchConditions.at(conditionIndex)
      .get('params').setValue('');
  }


  private updateSecCondParamOptions() {
    const extractOptions = (a: any[], key: string) => {
      return a.map(e => e[key])
        .filter(e => !isNullOrUndefined(e))
        .map(e => `${e}`)
        .filter(onlyUnique)
        .sort();
    };

    this.secCondParamOptions = {
      'source.name': extractOptions(this.sources, 'name'),
      'source.country': extractOptions(this.sources, 'country'),
      'source.region': extractOptions(this.sources, 'region'),
      'source.tier': extractOptions(this.sources, 'tier'),
      'source.parse_category': extractOptions(this.sources, 'parseCategory'),
      'source.red_circle': extractOptions(this.sources, 'redCircle'),
      'details.result': ['success', 'error'],
      'spider.kind': ['crawl', 'sitemap']
    };
  }


  private updateVisibleSecCondParamsOptions(conditionIndex: number) {

    const field = this.secondaryMatchConditions.at(conditionIndex)
      .get('field').value as SecondaryConditionField;

    const inputText = this.secondaryMatchConditions.at(conditionIndex)
      .get('params').value as string;

    const options = this.secCondParamOptions[field] || [];

    this.visibleSecCondParamOptions[conditionIndex] = options.filter(
      o => {
        const input = normalizeString(inputText || '').toLowerCase();
        return normalizeString(o).toLowerCase().indexOf(input) !== -1;
      }
    );
  }


  private addSecCondParam(conditionIndex: number, item: string) {
    this.secCondParams[conditionIndex].push(item);
  }


  private removeSecCondParam(conditionIndex: number, itemIndex: number) {
    this.secCondParams[conditionIndex] = (
      this.secCondParams[conditionIndex]
        .filter((p, i) => i !== itemIndex)
    );
  }

  private addTitleMatchKeywordItem(item: string) {
    this.titleMatchKeywordsList.push(item);
  }


  private removeTitleMatchKeywordItem(itemIndex: number) {
    this.titleMatchKeywordsList = (
      this.titleMatchKeywordsList
        .filter((p, i) => i !== itemIndex)
    );
  }

  private uniqueNameValidator(editor: EditorComponent):
    (control: AbstractControl) => ValidationErrors | null {

    return (control: AbstractControl): ValidationErrors | null => {
      const matches = editor.schemes ? editor.schemes.filter(s =>
        s.id !== this.selectedSchemeId
        && s.kind === this.selectedSchemeKind
        && s.name === control.value
      ) : [];

      return (matches.length === 0) ? null : { 'uniqueName': true };
    };
  }


  private articlePartValidator(control: AbstractControl): ValidationErrors | null {
    if (Object.values(ArticlePart).find(v => v === control.value)) {
      return null;
    }
    return { 'invalidChoice': true };
  }


  private matchCondValidator(control: AbstractControl): ValidationErrors | null {
    if (Object.values(MatchCondition).find(v => v === control.value)) {
      return null;
    }
    return { 'invalidChoice': true };
  }


  private emitCloseEvent() {
    this.close.emit();
  }
}
