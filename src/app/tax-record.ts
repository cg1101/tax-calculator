import { TaxRate } from './tax-rate';

export class TaxRecord {
  taxRate: TaxRate;
  createdAt: Date;
  gross: number;
  grossPlusSuper;
  superannuation: number;
  tax: number;
  net: number;  // taxableIncome - tax
  netPlusSuper: number; // net + superannuation
}
