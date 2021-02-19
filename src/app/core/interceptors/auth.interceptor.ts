import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService) {}

  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    if (httpRequest.url.includes(`${this.authenticationService.host}/login`)) {
      return httpHandler.handle(httpRequest);
    }
    if (httpRequest.url.includes(`${this.authenticationService.host}/register`)) {
      return httpHandler.handle(httpRequest);
    }
    if(this.authenticationService.isUserLoggedIn()){
      this.authenticationService.loadToken();
      const token = this.authenticationService.getToken();
      const request = httpRequest.clone({ setHeaders: { Authorization: `Bearer ${token}` }});
      return httpHandler.handle(request);
    }
    return httpHandler.handle(httpRequest.clone());
  }
}
