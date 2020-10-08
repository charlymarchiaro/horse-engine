import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsListService {


  private itemsPerPageSubject = new BehaviorSubject<number>(10);
  public itemsPerPage$ = this.itemsPerPageSubject.asObservable();


  constructor() { }


  public setItemsPerPage(value: number) {
    this.itemsPerPageSubject.next(value);
  }
}
