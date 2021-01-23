import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService, Tokens } from '../auth/auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);


  constructor(
    public authService: AuthService,
    private router: Router,
  ) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authService.getJwtToken()) {
      request = this.addToken(request, this.authService.getJwtToken());
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          // If not logged in, redirect to login on any error
          if (!this.authService.isLoggedIn()) {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);

            this.router.navigate(['auth/login']);

            return throwError(error);
          }
        }
      }));
  }


  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }


  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (request.url === '/api/auth/refresh') {
      this.authService.logout();

      this.isRefreshing = false;
      this.refreshTokenSubject.next(null);

      this.router.navigate(['auth/login']);
      return next.handle(request);
    }

    if (!this.isRefreshing) {
      // Start refresh
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: Tokens) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.accessToken);
          return next.handle(this.addToken(request, token.accessToken));
        })
      );

    } else {
      // Refresh in process, delay request
      return this.refreshTokenSubject.pipe(
        filter(accessToken => !!accessToken),
        take(1),
        switchMap(accessToken => {
          return next.handle(this.addToken(request, accessToken));
        }));
    }
  }
}
