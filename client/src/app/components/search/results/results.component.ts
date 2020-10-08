import { Component, OnInit } from '@angular/core';
import { LoadStatus, LoadState } from '../../../services/utils/load-status';
import { HighlightedArticle } from '../../../model/search.model';


@Component({
  selector: 'app-search-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  public loadState: LoadState;
  public LoadStatus = LoadStatus;


  public selectedArticle: HighlightedArticle;


  constructor() {
  }


  ngOnInit() {
  }

}
