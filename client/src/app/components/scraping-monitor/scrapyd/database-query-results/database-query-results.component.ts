import { Component, OnInit, Input } from '@angular/core';
import { DatabaseQueryResultsRow } from '../../model/shared/database.model';

@Component({
  selector: 'app-database-query-results',
  templateUrl: './database-query-results.component.html',
  styleUrls: ['./database-query-results.component.scss']
})
export class DatabaseQueryResultsComponent implements OnInit {

  public objectKeys = Object.keys;
  public objectValues = Object.values;


  @Input() public data: DatabaseQueryResultsRow[] = [];


  constructor() { }


  ngOnInit() {
  }
}
