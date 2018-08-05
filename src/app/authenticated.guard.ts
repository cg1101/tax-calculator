import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

  constructor(protected auth: AuthenticationService, protected router: Router) {
    console.log('AuthenticatedGuard constructor');
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log('canActivate is running');
    return of(null).pipe(
      tap(() => {
        console.log('inside canActivate');
      }),
      withLatestFrom(this.auth.isLoggedIn$),
      tap((aa) => {
        console.log('aa is', aa);
      }),
      map(([_, hasLoggedIn]) => {
        console.log('inside map', hasLoggedIn);
        return hasLoggedIn;
      }),
      switchMap(hasLoggedIn => {
        if (hasLoggedIn) {
          console.log('user already logged in');
          return of(true);
        } else {
          console.log('user not logged in, redirect to login');
          this.router.navigate(['/login']);
          return of(false);
        }
      }),
    );
  }
}
