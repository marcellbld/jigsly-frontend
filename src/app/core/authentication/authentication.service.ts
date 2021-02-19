import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RegistrationUser } from '../../shared/models/registration-user';


@Injectable({providedIn: 'root'})
export class AuthenticationService {
  public host = environment.apiUrl;
  private token: string | undefined | null;
  private loggedInUsername: string | undefined;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  public login(user: User): Observable<HttpResponse<User>> {
    return this.http.post<User>(`${this.host}/login`, user, { observe: 'response' });
  }

  public register(user: RegistrationUser): Observable<User> {
    return this.http.post<User>(`${this.host}/register`, user);
  }

  public logOut(): void {
    this.token = undefined;
    this.loggedInUsername = undefined;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public addUserToLocalCache(user: User): void {
    this.loggedInUsername = user.username;
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User | null {
    if(localStorage.getItem('user')){
      return JSON.parse(localStorage.getItem('user')!);
    }
    else{
      return null;
    }
  }

  public getUsername(): string | undefined {
    return this.loggedInUsername;
  }
  public loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  public getToken(): string | undefined | null {
    return this.token;
  }

  public isUserLoggedIn(): boolean {
    this.loadToken();
    if (this.token != null && this.token !== ''){
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          this.loggedInUsername = this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    }
    return false;
  }

}
