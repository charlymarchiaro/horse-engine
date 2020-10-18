import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {


  private collapsedSubject = new BehaviorSubject<boolean>(false);
  public collapsed$ = this.collapsedSubject.asObservable();


  constructor() { }


  public setCollapsed(value: boolean) {
    this.collapsedSubject.next(value);
  }
}
