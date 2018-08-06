import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { TaxRate } from './tax-rate';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(protected http: HttpClient, protected auth: AuthenticationService) { }

  getRateByYear(yr): Observable<TaxRate> {
    return of(yr).pipe(
      switchMap(year => {
        return this.http.get(`/rate`, {params: {year}, observe: 'response'}).pipe(
          map(resp => resp.body['rate']),
        );
      }),
    );
  }

  addRecord(data): Observable<any> {
    return of(null).pipe(
      withLatestFrom(this.auth.userInfo$),
      map(([_, userInfo]) => userInfo.userId),
      switchMap(userId => {
        data.userId = userId;
        return this.http.post(`/users/${userId}/history`, data, {observe: 'response'});
      }),
    );
  }

  loadHistory(): Observable<any> {
    return of(null).pipe(
      withLatestFrom(this.auth.userInfo$),
      map(([_, userInfo]) => userInfo.userId),
      switchMap(userId => {
        return this.http.get(`/users/${userId}/history`, {observe: 'response'});
      }),
    );
  }

  deleteRecord(index): Observable<any> {
    return of(null).pipe(
      withLatestFrom(this.auth.userInfo$),
      map(([_, userInfo]) => userInfo.userId),
      switchMap(userId => {
        return this.http.delete(`/users/${userId}/history`, {params: {index}, observe: 'response'});
      }),
    );
  }
}
