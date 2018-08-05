import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  userInfo$ = new BehaviorSubject<any>(null);
  error$ = new BehaviorSubject<string>('');

  constructor(protected http: HttpClient, protected router: Router) { }

  login(username: string, password: string) {
    this.http.post<any>('/login', {username, password}, {observe: 'response'}).pipe(
      catchError(error => {
        console.error('caught error', error);
        return throwError(error);
      })
    ).subscribe(response => {
      if (response.status === 200) {
        // login success
        this.isLoggedIn$.next(true);
        this.userInfo$.next(response.body);
        this.router.navigate(['/calculator']);
      } else {
        // login failed
        this.isLoggedIn$.next(false);
        this.error$.next(response.body.error || 'login failed');
      }
    });
  }

  logout() {
    this.isLoggedIn$.next(false);
    this.router.navigate(['/login']);
  }
}
