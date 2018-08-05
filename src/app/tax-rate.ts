export type TaxRateTier = [number, number, number, number];

export interface TaxRate {
  effectiveFrom?: Date; // if omitted, accept anytime until effectiveTo
  effectiveTo?: Date;   // if omitted, accept anytime from effectiveFrom
  tiers: TaxRateTier[]; // must have at least one
}
