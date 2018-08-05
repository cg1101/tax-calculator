import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate {

  constructor(protected auth: AuthenticationService, protected router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return of(null).pipe(
      withLatestFrom(this.auth.isLoggedIn$),
      map(([_, hasLoggedIn]) => {
        return hasLoggedIn;
      }),
      switchMap(hasLoggedIn => {
        if (hasLoggedIn) {
          return of(true);
        } else {
          this.router.navigate(['/login']);
          return of(false);
        }
      }),
    );
  }
}
