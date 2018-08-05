import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';

import { AuthenticationService } from '../authentication.service';
import { BackendService } from '../backend.service';
import { TaxRate } from '../tax-rate';
import { takeUntil } from 'rxjs/internal/operators';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnDestroy {

  ngDestroy$ = new Subject<void>();

  taxRate$: Observable<TaxRate>;
  taxRate: TaxRate;

  calculatorForm: FormGroup;

  minSuperRate = 9.5;

  constructor(public auth: AuthenticationService,
              protected backend: BackendService,
              protected fb: FormBuilder) {

    const year = (new Date()).getFullYear();
    const superRate = this.minSuperRate;
    const grossOnly = true;
    this.calculatorForm = this.fb.group({
      superRate: new FormControl(superRate, Validators.min(this.minSuperRate)),
      year: new FormControl(year),
      grossOnly: new FormControl(grossOnly),
      gross: '',
      grossPlusSuper: '',
      net: '',
      tax: '',
      netPlusSuper: ''
    });

    this.taxRate$ = this.calculatorForm.get('year').valueChanges.pipe(
      startWith({year}),
      distinctUntilChanged(),
      switchMap(year => {
        return this.backend.getYearRate(year);
      }),
    );

    this.calculatorForm.get('superRate').valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.ngDestroy$),
    ).subscribe(() => {
      this.calculate();
    });

    this.calculatorForm.get('grossOnly').valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.ngDestroy$),
    ).subscribe(() => {
      this.calculate();
    });

    this.taxRate$.subscribe((taxRate) => {
      console.log('taxRate changed to', taxRate);
      this.taxRate = taxRate;
      this.calculate();
    });
  }

  ngOnDestroy() {
    this.ngDestroy$.next();
    this.ngDestroy$.complete();
  }

  calculate() {
    console.log('re-calculating');
    const form = this.calculatorForm;
    const grossOnly = form.get('grossOnly').value;
    const superRate = form.get('superRate').value;
    let gross = form.get('gross').value;
    let grossPlusSuper = form.get('grossPlusSuper').value;
    if (grossOnly) {
      if (typeof gross === 'number') {
        grossPlusSuper = gross * (1 + superRate);
      } else {
        grossPlusSuper = null;
      }
      form.get('grossPlusSuper').setValue(grossPlusSuper);
    } else {
      if (typeof grossPlusSuper === 'number') {
        gross = grossPlusSuper / (1 + superRate);
      } else {
        gross = null;
        form.get('gross').setValue(gross);
      }
    }
  }

  submit() {
    console.log('submit form');
  }

}
