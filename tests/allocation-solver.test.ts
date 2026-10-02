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
});
