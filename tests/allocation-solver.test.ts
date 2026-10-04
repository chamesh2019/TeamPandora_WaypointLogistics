import { describe, it, expect } from 'vitest';
import { solveAllocation, type SolverOrderInput, type SolverVehicleInput } from '../lib/services/allocation-solver';

describe('Allocation Solver', () => {
  it('prioritizes orders deferred yesterday when capacity is tight', () => {
    // Setup test with small fleet and 2 orders where only 1 can fit due to weight limit (5000 kg cap vs 4000 kg each)
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-NORMAL',
        outlet_id: 'OUT1',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        temp_requirement: 'ambient',
        weight: 4000,
        volume: 20,
        deferred_yesterday: false,
        days_since_last_served: 1,
      },
      {
        order_id: 'ORD-STARVING',
        outlet_id: 'OUT2',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        temp_requirement: 'ambient',
        weight: 4000,
        volume: 20,
        deferred_yesterday: true,
        days_since_last_served: 2,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH001',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(1);
    expect(result.trips[0].orders.map((o) => o.order_id)).toContain('ORD-STARVING');
    expect(result.deferred.map((d) => d.order_id)).toContain('ORD-NORMAL');
    expect(result.deferred[0].reason_code).toBe('CAPACITY_WEIGHT');
  });

  it('allocates van_only stores exclusively to vans', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-VAN',
        outlet_id: 'OUT_VAN',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        temp_requirement: 'ambient',
        parking_constraint: 'van_only',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_TRUCK',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 6000,
        volume_cap_m3: 30,
        depot: 'PELIYAGODA',
        status: 'available',
      },
      {
        vehicle_id: 'VEH_VAN',
        type: 'van',
        temp: 'ambient',
        weight_cap_kg: 1500,
        volume_cap_m3: 8,
        depot: 'PELIYAGODA',
        status: 'available',
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(1);
    expect(result.trips[0].vehicle_id).toBe('VEH_VAN');
  });

  it('flags NO_REEFER_AVAILABLE when chilled order cannot find an available reefer vehicle', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-CHILLED',
        outlet_id: 'OUT_CHILLED',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        temp_requirement: 'chilled',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_AMBIENT',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 6000,
        volume_cap_m3: 30,
        depot: 'PELIYAGODA',
        status: 'available',
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(0);
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].reason_code).toBe('NO_REEFER_AVAILABLE');
  });

  it('flags NO_VAN_AVAILABLE when van_only order cannot find an available van', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-VAN-ONLY',
        outlet_id: 'OUT_VAN',
        brand: 'STYLE',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        parking_constraint: 'van_only',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_TRUCK',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 6000,
        volume_cap_m3: 30,
        depot: 'PELIYAGODA',
        status: 'available',
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(0);
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].reason_code).toBe('NO_VAN_AVAILABLE');
  });

  it('flags WORKSHOP_FLEET_SHORTAGE when compatible vehicle is in_workshop', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-1',
        outlet_id: 'OUT-1',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_WORKSHOP',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 6000,
        volume_cap_m3: 30,
        depot: 'PELIYAGODA',
        status: 'in_workshop',
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(0);
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].reason_code).toBe('WORKSHOP_FLEET_SHORTAGE');
  });

  it('correctly creates dual trips (Trip 1 and Trip 2) on a single vehicle within budgets', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-FRESH',
        outlet_id: 'OUT-F',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 1000,
        volume: 5,
        dock_type: 'rear_dock',
      },
      {
        order_id: 'ORD-STYLE',
        outlet_id: 'OUT-S',
        brand: 'STYLE',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 800,
        volume: 4,
        dock_type: 'rear_dock',
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_DUAL',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(2);
    expect(result.deferred.length).toBe(0);
    expect(result.trips[0].trip_number).toBe(1);
    expect(result.trips[0].brand).toBe('FRESH');
    expect(result.trips[1].trip_number).toBe(2);
    expect(result.trips[1].brand).toBe('STYLE');
    expect(result.kpi.fulfillment_rate_pct).toBe(100);
  });

  it('strictly caps a truck to at most 2 trips per day and defers additional trips', () => {
    // 3 orders with 3 different brands/districts requiring 3 separate trips
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-1',
        outlet_id: 'OUT-1',
        brand: 'FRESH',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
      {
        order_id: 'ORD-2',
        outlet_id: 'OUT-2',
        brand: 'STYLE',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
      {
        order_id: 'ORD-3',
        outlet_id: 'OUT-3',
        brand: 'TECH',
        district: 'Gampaha',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_SINGLE_TRUCK',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
      },
    ];

    const result = solveAllocation(orders, fleet);
    // Truck can only go 2 times!
    expect(result.trips.length).toBe(2);
    expect(result.trips[0].trip_number).toBe(1);
    expect(result.trips[1].trip_number).toBe(2);
    // 3rd order must be deferred
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].order_id).toBe('ORD-3');
    expect(result.deferred[0].reason_code).toBe('TIME_BUDGET_EXCEEDED');
  });

  it('accounts for existing_trips_count so vehicle with 1 existing trip can only do 1 more (Trip 2)', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-A',
        outlet_id: 'OUT-A',
        brand: 'STYLE',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
      {
        order_id: 'ORD-B',
        outlet_id: 'OUT-B',
        brand: 'TECH',
        district: 'Gampaha',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_PREV_1',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
        existing_trips_count: 1, // Already did 1 trip today
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(1);
    expect(result.trips[0].trip_number).toBe(2); // Assigned as Trip 2
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].reason_code).toBe('TIME_BUDGET_EXCEEDED');
  });

  it('defers all orders if available vehicles have already completed 2 trips today', () => {
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-X',
        outlet_id: 'OUT-X',
        brand: 'STYLE',
        district: 'Colombo',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_MAXED',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
        existing_trips_count: 2, // Reached 2-trip max limit
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(0);
    expect(result.deferred.length).toBe(1);
  });

  it('calculates trip distance and fuel consumption based on district travel matrix and km/l', () => {
    // Colombo: depot_to_district_km = 12, inter_stop_km = 4.0.
    // 3 stops -> dist = 2 * 12 + 2 * 4.0 = 32.0 km.
    // km_per_l = 6.4 -> fuel = 32.0 / 6.4 = 5.0 L.
    const orders: SolverOrderInput[] = [
      { order_id: 'O1', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 100, volume: 1 },
      { order_id: 'O2', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 100, volume: 1 },
      { order_id: 'O3', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 100, volume: 1 },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_FUEL_TEST',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
        km_per_l: 6.4,
        fuel_remaining_l: 50,
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(1);
    expect(result.trips[0].estimated_distance_km).toBe(32);
    expect(result.trips[0].estimated_fuel_liters).toBe(5);
    expect(result.trips[0].fuel_remaining_after_trip_l).toBe(45);
  });

  it('defers orders with FUEL_QUOTA_EXCEEDED when vehicle has insufficient fuel remaining for the trip', () => {
    // Galle: depot_to_district_km = 120 -> round trip = 240 km. At 6 km/l, requires 40L fuel.
    const orders: SolverOrderInput[] = [
      {
        order_id: 'ORD-GALLE',
        outlet_id: 'OUT-G',
        brand: 'FRESH',
        district: 'Galle',
        depot: 'PELIYAGODA',
        weight: 500,
        volume: 3,
      },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_LOW_FUEL',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
        km_per_l: 6.0,
        fuel_remaining_l: 15, // Only 15L remaining, but 40L needed!
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(0);
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].order_id).toBe('ORD-GALLE');
    expect(result.deferred[0].reason_code).toBe('FUEL_QUOTA_EXCEEDED');
  });

  it('depletes fuel after Trip 1 and defers Trip 2 if fuel is exhausted', () => {
    // Colombo: 1 stop requires 24 km / 6 km/l = 4L.
    // Galle: 1 stop requires 240 km / 6 km/l = 40L.
    // Vehicle has 20L remaining: Trip 1 (Colombo, 4L) succeeds (leaves 16L).
    // Trip 2 (Galle, 40L) cannot fit because 16L < 40L!
    const orders: SolverOrderInput[] = [
      { order_id: 'ORD-C', brand: 'FRESH', district: 'Colombo', depot: 'PELIYAGODA', weight: 500, volume: 3 },
      { order_id: 'ORD-G', brand: 'STYLE', district: 'Galle', depot: 'PELIYAGODA', weight: 500, volume: 3 },
    ];
    const fleet: SolverVehicleInput[] = [
      {
        vehicle_id: 'VEH_LIMITED_FUEL',
        type: 'truck',
        temp: 'ambient',
        weight_cap_kg: 5000,
        volume_cap_m3: 25,
        depot: 'PELIYAGODA',
        status: 'available',
        km_per_l: 6.0,
        fuel_remaining_l: 20,
      },
    ];

    const result = solveAllocation(orders, fleet);
    expect(result.trips.length).toBe(1);
    expect(result.trips[0].orders[0].order_id).toBe('ORD-C');
    expect(result.deferred.length).toBe(1);
    expect(result.deferred[0].order_id).toBe('ORD-G');
    expect(result.deferred[0].reason_code).toBe('FUEL_QUOTA_EXCEEDED');
  });
});
