import type { UseCase } from '../types';

export interface Plan {
  id: string;
  audience: UseCase;
  key: string;
  price: number;
  unitKey: string;
  featureCount: number;
  popular?: boolean;
}

/** Mock pricing plans — replace with GET /api/plans. */
export const mockPlans: Plan[] = [
{ id: 'plan-flex7', audience: 'driver', key: 'plans.flex7', price: 349, unitKey: 'common.perWeek', featureCount: 4 },
{ id: 'plan-flex14', audience: 'driver', key: 'plans.flex14', price: 329, unitKey: 'common.perWeek', featureCount: 4, popular: true },
{ id: 'plan-weekly', audience: 'driver', key: 'plans.weekly', price: 309, unitKey: 'common.perWeek', featureCount: 4 },
{ id: 'plan-day', audience: 'individual', key: 'plans.day', price: 79, unitKey: 'common.perDay', featureCount: 4 },
{ id: 'plan-week', audience: 'individual', key: 'plans.week', price: 329, unitKey: 'common.perWeek', featureCount: 4, popular: true },
{ id: 'plan-month', audience: 'individual', key: 'plans.month', price: 1190, unitKey: 'common.perMonth', featureCount: 4 }];


export type Inclusion = 'included' | 'optional' | 'vehicle';

export interface ComparisonRow {
  labelKey: string;
  values: Record<string, Inclusion>;
}

export const driverComparison: ComparisonRow[] = [
{ labelKey: 'pricingPage.rowVehicle', values: { 'plan-flex7': 'included', 'plan-flex14': 'included', 'plan-weekly': 'included' } },
{ labelKey: 'pricingPage.rowMaintenance', values: { 'plan-flex7': 'included', 'plan-flex14': 'included', 'plan-weekly': 'included' } },
{ labelKey: 'pricingPage.rowSupport', values: { 'plan-flex7': 'included', 'plan-flex14': 'included', 'plan-weekly': 'included' } },
{ labelKey: 'pricingPage.rowInsurance', values: { 'plan-flex7': 'optional', 'plan-flex14': 'optional', 'plan-weekly': 'optional' } },
{ labelKey: 'pricingPage.rowSwap', values: { 'plan-flex7': 'vehicle', 'plan-flex14': 'included', 'plan-weekly': 'included' } },
{ labelKey: 'pricingPage.rowMileage', values: { 'plan-flex7': 'optional', 'plan-flex14': 'optional', 'plan-weekly': 'included' } },
{ labelKey: 'pricingPage.rowCharge', values: { 'plan-flex7': 'optional', 'plan-flex14': 'optional', 'plan-weekly': 'optional' } }];


export const individualComparison: ComparisonRow[] = [
{ labelKey: 'pricingPage.rowVehicle', values: { 'plan-day': 'included', 'plan-week': 'included', 'plan-month': 'included' } },
{ labelKey: 'pricingPage.rowMaintenance', values: { 'plan-day': 'included', 'plan-week': 'included', 'plan-month': 'included' } },
{ labelKey: 'pricingPage.rowSupport', values: { 'plan-day': 'included', 'plan-week': 'included', 'plan-month': 'included' } },
{ labelKey: 'pricingPage.rowInsurance', values: { 'plan-day': 'optional', 'plan-week': 'optional', 'plan-month': 'optional' } },
{ labelKey: 'pricingPage.rowSwap', values: { 'plan-day': 'vehicle', 'plan-week': 'vehicle', 'plan-month': 'included' } },
{ labelKey: 'pricingPage.rowMileage', values: { 'plan-day': 'optional', 'plan-week': 'included', 'plan-month': 'included' } },
{ labelKey: 'pricingPage.rowCharge', values: { 'plan-day': 'optional', 'plan-week': 'optional', 'plan-month': 'optional' } }];


export function plansFor(audience: UseCase): Plan[] {
  return mockPlans.filter((plan) => plan.audience === audience);
}