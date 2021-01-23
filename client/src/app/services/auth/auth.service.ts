import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mapTo, tap, catchError, filter } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';
import { generateAvatarImageUrl } from '../utils/user-avatar-generator';


export interface Tokens {
  accessToken: string;
  refreshToken: string;
}


export enum Role {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
}


export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles?: Role[];
  lastLogin?: Date;
  passwordRequestedAt?: Date;
  avatarImgUrl: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  private loggedUser: User;


  constructor(
    private http: HttpClient,
  ) { }


  login(user: { email: string, password: string }): Observable<boolean> {

    const params = JSON.stringify(user);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<Tokens>(
      '/api/auth/refresh-login',
      params,
      { headers },
    )
      .pipe(
        tap(tokens => this.doLoginUser(user.email, tokens)),
        mapTo(true),
      );
  }


  logout() {
    this.doLogoutUser();

    const params = JSON.stringify({
      refreshToken: this.getRefreshToken()
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(
      '/api/auth/logout',
      params,
      { headers },
    )
      .pipe(
        mapTo(true),
        catchError(error => {
          return of(false);
        }));
  }


  isLoggedIn() {
    return !!this.getJwtToken();
  }


  refreshToken() {
    const params = JSON.stringify({
      refreshToken: this.getRefreshToken()
    });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.updateUser();

    return this.http.post<Tokens>(
      '/api/auth/refresh',
      params,
      { headers },
    )
      .pipe(
        tap(tokens => this.storeJwtToken(tokens.accessToken)),
      );
  }


  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }


  getUser() {
    return this.loggedUser;
  }


  private doLoginUser(email: string, tokens: Tokens) {
    this.storeTokens(tokens);
    this.updateUser();
  }


  private doLogoutUser() {
    this.removeTokens();
    this.updateUser();
  }


  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }


  private storeJwtToken(jwt: string) {
    localStorage.setItem(this.JWT_TOKEN, jwt);
  }


  private storeTokens(tokens: Tokens) {
    localStorage.setItem(this.JWT_TOKEN, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }


  private removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
  }


  private updateUser() {
    if (!this.isLoggedIn()) {
      this.loggedUser = null;
      console.log(this.loggedUser);
      return;
    }

    this.http.get<any>('/api/auth/users/me', {})
      .pipe(filter(r => !!r))
      .subscribe(
        r => {
          this.loggedUser = {
            id: r.id,
            email: r.email,
            firstName: r.firstName,
            lastName: r.lastName,
            enabled: r.enabled,
            roles: r.roles,
            lastLogin: r.lastLogin ? new Date(r.lastLogin) : null,
            passwordRequestedAt: r.passwordRequestedAt ? new Date(r.passwordRequestedAt) : null,
            avatarImgUrl: generateAvatarImageUrl(r.firstName, r.lastName),
          };
          console.log(this.loggedUser);
        }
      );
  }
}
