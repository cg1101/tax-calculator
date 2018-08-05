import { Injectable } from '@angular/core';

import { TaxRate } from './tax-rate';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor() { }

  getYearRate(year): Observable<TaxRate> {
    return of(<TaxRate>{
      tiers: [
        [0, 18200, 0, 0],
        [18200, 37000, 0.19, 0],
        [37000, 87000, 0.325, 3572],
        [87000, 180000, 0.37, 19822],
        [180000, +Infinity, 0.45, 54232],
      ],
    });
  }
}
