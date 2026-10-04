import { describe, it, expect } from 'vitest';
import {
  calculateTripDuration,
  validateTripFeasibility,
  validateFullAllocationPlan,
  type DistrictTravel,
  type TripValidationInput,
  type FullAllocationPlanInput,
  type ReferenceData,
} from '../lib/services/allocation-validator';

describe('Trip Duration Calculation', () => {
  const dtravel: Record<string, DistrictTravel> = {
    Gampaha: { depot_to_district_freeflow_min: 37, inter_stop_freeflow_min: 9 },
    Colombo: { depot_to_district_freeflow_min: 24, inter_stop_freeflow_min: 8 },
  };
  const allowances: Record<string, number> = {
    'FRESH:rear_dock': 15,
    'FRESH:street': 16,
    'STYLE:rear_dock': 38,
  };

  it('matches the official booklet worked example for Gampaha Fresh 3-stop trip', () => {
    // 37 + 2*9 + 15 + 15 + 16 = 101 min
    const duration = calculateTripDuration('Gampaha', 'FRESH', ['rear_dock', 'rear_dock', 'street'], dtravel, allowances);
    expect(duration).toBe(101);
  });

  it('calculates 0 inter-stop travel for a single-stop trip', () => {
    const duration = calculateTripDuration('Gampaha', 'FRESH', ['rear_dock'], dtravel, allowances);
    expect(duration).toBe(52); // 37 + 0 + 15
  });

  it('returns 0 for empty stops trip', () => {
    const duration = calculateTripDuration('Gampaha', 'FRESH', [], dtravel, allowances);
    expect(duration).toBe(0);
  });
});

describe('Feasibility Rule Checks', () => {
  it('fails when chilled orders are placed on ambient vehicles', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH002', type: 'truck', temp: 'ambient', weight_cap_kg: 6000, volume_cap_m3: 32, depot: 'PELIYAGODA' },
      orders: [{ order_id: 'ORD1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', temp_requirement: 'chilled', weight: 500, volume: 2 }],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('carries chilled orders on a non-refrigerated vehicle');
  });

  it('fails when van_only outlets are served by trucks', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH001', type: 'truck', temp: 'reefer', weight_cap_kg: 5000, volume_cap_m3: 26, depot: 'PELIYAGODA' },
      orders: [{ order_id: 'ORD1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', parking_constraint: 'van_only', weight: 500, volume: 2 }],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('sends a truck to a van_only outlet');
  });

  it('fails when orders from different brands are mixed in a single trip', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 26, depot: 'PELIYAGODA' },
      orders: [
        { order_id: 'ORD1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 500, volume: 2 },
        { order_id: 'ORD2', brand: 'STYLE', district: 'Colombo', depot: 'PELIYAGODA', weight: 300, volume: 1 },
      ],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('mixed brands'))).toBe(true);
  });

  it('fails when orders from different districts are mixed in a single trip', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 26, depot: 'PELIYAGODA' },
      orders: [
        { order_id: 'ORD1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 500, volume: 2 },
        { order_id: 'ORD2', brand: 'FRESH', district: 'Gampaha', depot: 'PELIYAGODA', weight: 300, volume: 1 },
      ],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('mixed districts'))).toBe(true);
  });

  it('fails when order depot does not match vehicle home depot', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 26, depot: 'PELIYAGODA' },
      orders: [
        { order_id: 'ORD1', brand: 'FRESH', district: 'Kandy', depot: 'KANDY', weight: 500, volume: 2 },
      ],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('depot mismatch'))).toBe(true);
  });

  it('fails when weight capacity is exceeded', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH001', type: 'van', temp: 'ambient', weight_cap_kg: 1000, volume_cap_m3: 10, depot: 'PELIYAGODA' },
      orders: [
        { order_id: 'ORD1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 1000.5, volume: 2 },
      ],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('weight capacity exceeded'))).toBe(true);
  });

  it('fails when volume capacity is exceeded', () => {
    const result = validateTripFeasibility({
      vehicle: { vehicle_id: 'VEH001', type: 'van', temp: 'ambient', weight_cap_kg: 2000, volume_cap_m3: 5, depot: 'PELIYAGODA' },
      orders: [
        { order_id: 'ORD1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 500, volume: 5.2 },
      ],
      tripNumber: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('volume capacity exceeded'))).toBe(true);
  });
});

describe('Full Allocation Plan Validation', () => {
  const refData: ReferenceData = {
    districtTravel: {
      Colombo: { depot_to_district_freeflow_min: 24, inter_stop_freeflow_min: 8 },
    },
    serviceAllowances: {
      'FRESH:rear_dock': 15,
      'STYLE:rear_dock': 38,
    },
  };

  it('fails when a vehicle is assigned more than 2 trips in a day', () => {
    const vehicle = { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 25, depot: 'PELIYAGODA' };
    const plan: FullAllocationPlanInput = {
      plan_date: '2026-10-01',
      trips: [
        { vehicle, tripNumber: 1, brand: 'FRESH', district: 'Colombo', orders: [{ order_id: 'O1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', dock_type: 'rear_dock', weight: 100, volume: 1 }] },
        { vehicle, tripNumber: 2, brand: 'FRESH', district: 'Colombo', orders: [{ order_id: 'O2', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', dock_type: 'rear_dock', weight: 100, volume: 1 }] },
        { vehicle, tripNumber: 3, brand: 'FRESH', district: 'Colombo', orders: [{ order_id: 'O3', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', dock_type: 'rear_dock', weight: 100, volume: 1 }] },
      ],
    };
    const result = validateFullAllocationPlan(plan, refData);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('exceeds maximum 2 trips per day'))).toBe(true);
  });

  it('fails when a vehicle is assigned to a trip while in_workshop', () => {
    const vehicle = { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 25, depot: 'PELIYAGODA', status: 'in_workshop' };
    const plan: FullAllocationPlanInput = {
      plan_date: '2026-10-01',
      trips: [
        { vehicle, tripNumber: 1, brand: 'FRESH', district: 'Colombo', orders: [{ order_id: 'O1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', dock_type: 'rear_dock', weight: 100, volume: 1 }] },
      ],
    };
    const result = validateFullAllocationPlan(plan, refData);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('in_workshop'))).toBe(true);
  });

  it('fails when a fresh trip exceeds 270 minutes time budget', () => {
    const vehicle = { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 25, depot: 'PELIYAGODA' };
    // 24 + 19 * 8 + 20 * 15 = 24 + 152 + 300 = 476 min > 270
    const orders = Array.from({ length: 20 }, (_, i) => ({
      order_id: `O${i}`,
      brand: 'FRESH',
      district: 'Colombo',
      depot: 'PELIYAGODA',
      dock_type: 'rear_dock',
      weight: 50,
      volume: 0.5,
    }));
    const plan: FullAllocationPlanInput = {
      plan_date: '2026-10-01',
      trips: [
        { vehicle, tripNumber: 1, brand: 'FRESH', district: 'Colombo', orders },
      ],
    };
    const result = validateFullAllocationPlan(plan, refData);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('exceeds maximum budget of 270 minutes'))).toBe(true);
  });

  it('passes for a valid plan with dual trips within budgets', () => {
    const vehicle = { vehicle_id: 'VEH001', type: 'truck', temp: 'ambient', weight_cap_kg: 5000, volume_cap_m3: 25, depot: 'PELIYAGODA' };
    const plan: FullAllocationPlanInput = {
      plan_date: '2026-10-01',
      trips: [
        {
          vehicle,
          tripNumber: 1,
          brand: 'FRESH',
          district: 'Colombo',
          orders: [
            { order_id: 'O1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', dock_type: 'rear_dock', weight: 500, volume: 2 },
          ],
        },
        {
          vehicle,
          tripNumber: 2,
          brand: 'STYLE',
          district: 'Colombo',
          orders: [
            { order_id: 'O2', brand: 'STYLE', district: 'Colombo', depot: 'PELIYAGODA', dock_type: 'rear_dock', weight: 500, volume: 2 },
          ],
        },
      ],
    };
    const result = validateFullAllocationPlan(plan, refData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
