import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  isLoading = false;
  errorMessage = false;
  message = 'Something went terribly wrong. Just keep calm and carry on!';


  constructor() { }


  ngOnInit() {
  }


  sampleRefresh() {
    this.isLoading = true;
    this.errorMessage = false;
    setTimeout(() => {
      this.isLoading = false;
      this.errorMessage = true;
    }, 3000);
  }
}
