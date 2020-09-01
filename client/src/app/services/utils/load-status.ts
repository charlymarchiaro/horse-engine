import { Observable, BehaviorSubject } from 'rxjs';

export enum LoadStatus {
  notLoaded = 'NOT_LOADED',
  loading = 'LOADING',
  loaded = 'LOADED',
  error = 'ERROR',
}


export interface LoadState {
  status: LoadStatus;
  errorMessage: string;
}


export class LoadStateHandler {

  private stateSubject = new BehaviorSubject<LoadState>({
    status: LoadStatus.notLoaded,
    errorMessage: null,
  });

  public state$ = this.stateSubject.asObservable();


  constructor() {
    this.reset();
  }

  public startLoad() {
    this.stateSubject.next({
      status: LoadStatus.loading,
      errorMessage: null,
    });
  }

  public loadSuccess() {
    this.stateSubject.next({
      status: LoadStatus.loaded,
      errorMessage: null,
    });
  }

  public loadError(errorMessage) {
    this.stateSubject.next({
      status: LoadStatus.error,
      errorMessage: errorMessage,
    });
  }

  public reset() {
    this.stateSubject.next({
      status: LoadStatus.notLoaded,
      errorMessage: null,
    });
  }
}
