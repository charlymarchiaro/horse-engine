import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public isLoading = false;
  public errorMessage = false;
  public message: string = null;


  constructor(
  ) { }


  ngOnInit() {
  }
}
