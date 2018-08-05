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
      gross: 0,
      grossPlusSuper: 0,
      superannuation: 0,
      net: 0,
      tax: 0,
      netPlusSuper: 0,
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
      this.taxRate = taxRate;
      this.calculate();
    });

    this.calculatorForm.get('gross').valueChanges.pipe(
      takeUntil(this.ngDestroy$),
    ).subscribe(() => {
      if (this.calculatorForm.get('grossOnly').value) {
        this.calculate();
      }
    });

    this.calculatorForm.get('grossPlusSuper').valueChanges.pipe(
      takeUntil(this.ngDestroy$),
    ).subscribe(() => {
      if (!this.calculatorForm.get('grossOnly').value) {
        this.calculate();
      }
    });
  }

  ngOnDestroy() {
    this.ngDestroy$.next();
    this.ngDestroy$.complete();
  }

  getTaxCalculator(taxRate: TaxRate) {
    return (taxableIncome) => {
      for (let i in taxRate.tiers) {
        const [lower, upper, ratio, plus] = taxRate.tiers[i];
        if (taxableIncome >= lower && taxableIncome < upper) {
          const tax = plus + (taxableIncome - lower) * ratio;
          return tax;
        }
      }
    }
  }

  calculate() {
    const form = this.calculatorForm;
    const grossOnly = form.get('grossOnly').value;
    const superRate = form.get('superRate').value;
    let gross = form.get('gross').value;
    let grossPlusSuper = form.get('grossPlusSuper').value;
    if (grossOnly) {
      if (typeof gross === 'number') {
        grossPlusSuper = parseFloat(Number(gross * (1 + superRate / 100)).toFixed(2));
      } else {
        grossPlusSuper = 0;
      }
      form.get('grossPlusSuper').setValue(grossPlusSuper);
    } else {
      if (typeof grossPlusSuper === 'number') {
        gross = parseFloat(Number(grossPlusSuper / (1 + superRate / 100)).toFixed(2));
      } else {
        gross = 0;
      }
      form.get('gross').setValue(gross);
    }
    const calculator = this.getTaxCalculator(this.taxRate);
    const superannuation = gross * (superRate / 100.0);
    const tax = calculator(gross);
    const net = gross - tax;
    const netPlusSuper = net + superannuation;
    form.get('tax').setValue(tax);
    form.get('net').setValue(net);
    form.get('netPlusSuper').setValue(netPlusSuper);
    form.get('superannuation').setValue(superannuation);
  }

  submit() {
    const data = this.calculatorForm.value;
    console.log('submit form using data', data);
  }

}
