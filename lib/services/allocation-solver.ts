import {
  calculateTripDuration,
  type DistrictTravel,
} from './allocation-validator';

export interface SolverOrderInput {
  order_id: string;
  outlet_id?: string;
  outlet_name?: string;
  brand: string; // 'FRESH' | 'STYLE' | 'TECH'
  district: string;
  depot: string; // 'PELIYAGODA' | 'KANDY'
  temp_requirement?: string; // 'ambient' | 'chilled'
  parking_constraint?: string; // 'none' | 'van_only'
  dock_type?: string; // 'rear_dock' | 'street' | 'mall_bay'
  weight: number;
  volume: number;
  deferred_yesterday?: boolean;
  days_since_last_served?: number;
}

export interface SolverVehicleInput {
  vehicle_id: string;
  type: string; // 'truck' | 'van'
  temp: string; // 'ambient' | 'reefer'
  weight_cap_kg: number;
  volume_cap_m3: number;
  depot: string; // 'PELIYAGODA' | 'KANDY'
  status?: string; // 'available' | 'in_workshop' | etc.
  existing_trips_count?: number; // Previous trips already assigned today
  fuel_remaining_l?: number; // Fuel remaining in vehicle fuel tank / weekly quota
  km_per_l?: number; // Fuel efficiency in km per liter
  weekly_fuel_quota_l?: number; // Total weekly quota in liters
}

export interface ProposedTripStop {
  order_id: string;
  outlet_id?: string;
  outlet_name?: string;
  sequence_number: number;
  dock_type?: string;
  weight: number;
  volume: number;
}

export interface ProposedTrip {
  vehicle_id: string;
  vehicle_type: string;
  vehicle_temp: string;
  trip_number: number; // 1 or 2
  brand: string;
  district: string;
  depot: string;
  duration_minutes: number;
  total_weight_kg: number;
  total_volume_m3: number;
  weight_utilization_pct: number;
  volume_utilization_pct: number;
  orders: SolverOrderInput[];
  stops: ProposedTripStop[];
  estimated_distance_km?: number;
  estimated_fuel_liters?: number;
  fuel_remaining_after_trip_l?: number;
}

export type DeferralReasonCode =
  | 'CAPACITY_WEIGHT'
  | 'CAPACITY_VOLUME'
  | 'TIME_BUDGET_EXCEEDED'
  | 'NO_REEFER_AVAILABLE'
  | 'NO_VAN_AVAILABLE'
  | 'WORKSHOP_FLEET_SHORTAGE'
  | 'FUEL_QUOTA_EXCEEDED';

export interface DeferredOrder {
  order_id: string;
  outlet_id?: string;
  outlet_name?: string;
  brand: string;
  district: string;
  depot: string;
  weight: number;
  volume: number;
  reason_code: DeferralReasonCode;
  notes?: string;
}

export interface AllocationKPI {
  total_orders: number;
  planned_orders: number;
  deferred_orders: number;
  fulfillment_rate_pct: number;
  total_weight_kg: number;
  total_volume_m3: number;
  active_vehicles_count: number;
  total_trips_count: number;
  total_estimated_fuel_l?: number;
}

export interface SolverOptions {
  districtTravel?: Record<string, DistrictTravel>;
  serviceAllowances?: Record<string, number>;
}

export interface SolverResult {
  trips: ProposedTrip[];
  deferred: DeferredOrder[];
  kpi: AllocationKPI;
}

export const DEFAULT_DISTRICT_TRAVEL: Record<string, DistrictTravel> = {
  Colombo: { depot_to_district_freeflow_min: 24, inter_stop_freeflow_min: 8, depot_to_district_km: 12, inter_stop_km: 4.0 },
  Gampaha: { depot_to_district_freeflow_min: 37, inter_stop_freeflow_min: 9, depot_to_district_km: 28, inter_stop_km: 7.0 },
  Kalutara: { depot_to_district_freeflow_min: 64, inter_stop_freeflow_min: 12, depot_to_district_km: 48, inter_stop_km: 9.0 },
  Galle: { depot_to_district_freeflow_min: 103, inter_stop_freeflow_min: 9, depot_to_district_km: 120, inter_stop_km: 10.0 },
  Matara: { depot_to_district_freeflow_min: 137, inter_stop_freeflow_min: 10, depot_to_district_km: 160, inter_stop_km: 12.0 },
  Kurunegala: { depot_to_district_freeflow_min: 127, inter_stop_freeflow_min: 19, depot_to_district_km: 95, inter_stop_km: 14.0 },
  Puttalam: { depot_to_district_freeflow_min: 173, inter_stop_freeflow_min: 24, depot_to_district_km: 130, inter_stop_km: 18.0 },
  Kandy: { depot_to_district_freeflow_min: 16, inter_stop_freeflow_min: 6, depot_to_district_km: 8, inter_stop_km: 3.0 },
  Matale: { depot_to_district_freeflow_min: 35, inter_stop_freeflow_min: 11, depot_to_district_km: 26, inter_stop_km: 8.0 },
  'Nuwara Eliya': { depot_to_district_freeflow_min: 111, inter_stop_freeflow_min: 20, depot_to_district_km: 78, inter_stop_km: 14.0 },
  Badulla: { depot_to_district_freeflow_min: 186, inter_stop_freeflow_min: 23, depot_to_district_km: 130, inter_stop_km: 16.0 },
  Kegalle: { depot_to_district_freeflow_min: 53, inter_stop_freeflow_min: 13, depot_to_district_km: 40, inter_stop_km: 10.0 },
};

/**
 * Calculates total route distance in km for a trip:
 * (2 * depot_to_district_km) + ((stops - 1) * inter_stop_km)
 */
export function calculateTripDistance(
  district: string,
  stopCount: number,
  dtravelMap: Record<string, DistrictTravel> = DEFAULT_DISTRICT_TRAVEL
): number {
  const dt = dtravelMap[district] || { depot_to_district_km: 25, inter_stop_km: 8, depot_to_district_freeflow_min: 30, inter_stop_freeflow_min: 10 };
  const depotKm = dt.depot_to_district_km ?? 25;
  const interKm = dt.inter_stop_km ?? 8;
  const interStops = Math.max(0, stopCount - 1);
  return Number(((2 * depotKm) + (interStops * interKm)).toFixed(2));
}

/**
 * Calculates fuel consumed in liters for a trip based on distance and vehicle km_per_l:
 * route_distance_km / vehicle.km_per_l
 */
export function calculateTripFuel(
  district: string,
  stopCount: number,
  kmPerL?: number,
  dtravelMap: Record<string, DistrictTravel> = DEFAULT_DISTRICT_TRAVEL
): number {
  const dist = calculateTripDistance(district, stopCount, dtravelMap);
  const efficiency = kmPerL && kmPerL > 0 ? kmPerL : 5.0; // default 5.0 km/l if unspecified
  return Number((dist / efficiency).toFixed(2));
}

const DEFAULT_SERVICE_ALLOWANCES: Record<string, number> = {
  'FRESH:rear_dock': 15,
  'FRESH:street': 16,
  'FRESH:mall_bay': 18,
  'STYLE:rear_dock': 38,
  'STYLE:street': 46,
  'STYLE:mall_bay': 59,
  'TECH:rear_dock': 43,
  'TECH:street': 55,
  'TECH:mall_bay': 55,
};

const FLOAT_EPSILON = 1e-6;

/**
 * Calculates priority score for anti-starvation:
 * (deferred_yesterday ? 1000 : 0) + (days_since_last_served * 100) + brandWeight
 */
export function calculateOrderPriority(order: SolverOrderInput): number {
  let score = 0;
  if (order.deferred_yesterday) {
    score += 1000;
  }
  const daysSince = order.days_since_last_served ?? 1;
  score += daysSince * 100;

  const brandUpper = (order.brand || '').toUpperCase();
  if (brandUpper === 'FRESH') {
    score += 30;
  } else if (brandUpper === 'STYLE') {
    score += 20;
  } else if (brandUpper === 'TECH') {
    score += 10;
  }

  return score;
}

/**
 * Solves the Daily Order Allocation problem with a clustered greedy bin-packing routine.
 */
export function solveAllocation(
  orders: SolverOrderInput[],
  fleet: SolverVehicleInput[],
  options?: SolverOptions
): SolverResult {
  const dtravel = options?.districtTravel || DEFAULT_DISTRICT_TRAVEL;
  const allowances = options?.serviceAllowances || DEFAULT_SERVICE_ALLOWANCES;

  const activeVehicles = fleet.filter((v) => v.status !== 'in_workshop');
  const workshopVehicles = fleet.filter((v) => v.status === 'in_workshop');

  // Track allocation state per vehicle
  interface VehicleState {
    vehicle: SolverVehicleInput;
    remainingFuelL: number;
    trips: Array<{
      trip_number: number;
      brand: string;
      district: string;
      depot: string;
      orders: SolverOrderInput[];
      distanceKm: number;
      fuelLiters: number;
    }>;
  }

  const vehicleStates = new Map<string, VehicleState>();
  for (const v of activeVehicles) {
    const initFuel =
      v.fuel_remaining_l !== undefined
        ? Number(v.fuel_remaining_l)
        : Number(v.weekly_fuel_quota_l || 500);
    vehicleStates.set(v.vehicle_id, {
      vehicle: v,
      remainingFuelL: initFuel,
      trips: [],
    });
  }

  // 1. Group orders into clusters by (depot, brand, district)
  const clusters = new Map<string, SolverOrderInput[]>();
  for (const order of orders) {
    const key = `${order.depot.toUpperCase()}:${order.brand.toUpperCase()}:${order.district}`;
    if (!clusters.has(key)) {
      clusters.set(key, []);
    }
    clusters.get(key)!.push(order);
  }

  // Sort clusters: Fresh first (Window 1), then Style & Tech (Window 2)
  const sortedClusterKeys = Array.from(clusters.keys()).sort((a, b) => {
    const isAFresh = a.includes(':FRESH:');
    const isBFresh = b.includes(':FRESH:');
    if (isAFresh && !isBFresh) return -1;
    if (!isAFresh && isBFresh) return 1;
    return a.localeCompare(b);
  });

  const deferred: DeferredOrder[] = [];

  // Helper to check if an order fits into an existing trip
  const fitsInTrip = (
    vState: VehicleState,
    tripIndex: number,
    order: SolverOrderInput
  ): { fits: boolean; reason?: DeferralReasonCode } => {
    const trip = vState.trips[tripIndex];
    const vehicle = vState.vehicle;

    // Check temp requirement
    if ((order.temp_requirement || '').toLowerCase() === 'chilled' && vehicle.temp !== 'reefer') {
      return { fits: false, reason: 'NO_REEFER_AVAILABLE' };
    }
    // Check parking constraint
    if ((order.parking_constraint || '').toLowerCase() === 'van_only' && vehicle.type !== 'van') {
      return { fits: false, reason: 'NO_VAN_AVAILABLE' };
    }

    const currentWeight = trip.orders.reduce((sum, o) => sum + o.weight, 0);
    if (currentWeight + order.weight > vehicle.weight_cap_kg + FLOAT_EPSILON) {
      return { fits: false, reason: 'CAPACITY_WEIGHT' };
    }

    const currentVolume = trip.orders.reduce((sum, o) => sum + o.volume, 0);
    if (currentVolume + order.volume > vehicle.volume_cap_m3 + FLOAT_EPSILON) {
      return { fits: false, reason: 'CAPACITY_VOLUME' };
    }

    const newDockTypes = [...trip.orders.map((o) => o.dock_type || 'rear_dock'), order.dock_type || 'rear_dock'];
    const newDuration = calculateTripDuration(trip.district, trip.brand, newDockTypes, dtravel, allowances);

    const isFresh = trip.brand.toUpperCase() === 'FRESH';
    const maxBudget = isFresh ? 270 : 480;
    if (newDuration > maxBudget) {
      return { fits: false, reason: 'TIME_BUDGET_EXCEEDED' };
    }

    // Check fuel quota for extended trip with additional stop
    const newStopCount = trip.orders.length + 1;
    const newFuel = calculateTripFuel(trip.district, newStopCount, vehicle.km_per_l, dtravel);
    const fuelDelta = newFuel - trip.fuelLiters;
    if (vState.remainingFuelL < fuelDelta - FLOAT_EPSILON) {
      return { fits: false, reason: 'FUEL_QUOTA_EXCEEDED' };
    }

    return { fits: true };
  };

  // Helper to check if an order can start a new trip on a vehicle
  const canStartTrip = (
    vState: VehicleState,
    order: SolverOrderInput
  ): { canStart: boolean; reason?: DeferralReasonCode } => {
    const vehicle = vState.vehicle;
    const existingCount = vehicle.existing_trips_count || 0;
    // Strict constraint: one truck/van can only go at most 2 times per day
    if (vState.trips.length + existingCount >= 2) {
      return { canStart: false, reason: 'TIME_BUDGET_EXCEEDED' };
    }

    if (vehicle.depot.toUpperCase() !== order.depot.toUpperCase()) {
      return { canStart: false };
    }

    const isFresh = order.brand.toUpperCase() === 'FRESH';
    // Fresh window (03:30 - 08:00) permits at most 1 Fresh trip per vehicle per day
    if (isFresh && vState.trips.some((t) => t.brand.toUpperCase() === 'FRESH')) {
      return { canStart: false, reason: 'TIME_BUDGET_EXCEEDED' };
    }

    if ((order.temp_requirement || '').toLowerCase() === 'chilled' && vehicle.temp !== 'reefer') {
      return { canStart: false, reason: 'NO_REEFER_AVAILABLE' };
    }

    if ((order.parking_constraint || '').toLowerCase() === 'van_only' && vehicle.type !== 'van') {
      return { canStart: false, reason: 'NO_VAN_AVAILABLE' };
    }

    if (order.weight > vehicle.weight_cap_kg + FLOAT_EPSILON) {
      return { canStart: false, reason: 'CAPACITY_WEIGHT' };
    }

    if (order.volume > vehicle.volume_cap_m3 + FLOAT_EPSILON) {
      return { canStart: false, reason: 'CAPACITY_VOLUME' };
    }

    const duration = calculateTripDuration(
      order.district,
      order.brand,
      [order.dock_type || 'rear_dock'],
      dtravel,
      allowances
    );

    const maxBudget = isFresh ? 270 : 480;
    if (duration > maxBudget) {
      return { canStart: false, reason: 'TIME_BUDGET_EXCEEDED' };
    }

    // Check combined daytime budget if adding another daytime trip
    if (!isFresh) {
      const existingDaytimeTrips = vState.trips.filter((t) => t.brand.toUpperCase() !== 'FRESH');
      const existingDaytimeDuration = existingDaytimeTrips.reduce((sum, t) => {
        const docks = t.orders.map((o) => o.dock_type || 'rear_dock');
        return sum + calculateTripDuration(t.district, t.brand, docks, dtravel, allowances);
      }, 0);

      if (existingDaytimeDuration + duration > 480) {
        return { canStart: false, reason: 'TIME_BUDGET_EXCEEDED' };
      }
    }

    // Check fuel quota for this new trip
    const tripFuel = calculateTripFuel(order.district, 1, vehicle.km_per_l, dtravel);
    if (vState.remainingFuelL < tripFuel - FLOAT_EPSILON) {
      return { canStart: false, reason: 'FUEL_QUOTA_EXCEEDED' };
    }

    return { canStart: true };
  };

  // Process clusters
  for (const clusterKey of sortedClusterKeys) {
    const clusterOrders = clusters.get(clusterKey)!;
    // Sort orders by anti-starvation priority descending
    clusterOrders.sort((a, b) => {
      const diff = calculateOrderPriority(b) - calculateOrderPriority(a);
      if (diff !== 0) return diff;
      return b.weight - a.weight;
    });

    for (const order of clusterOrders) {
      let allocated = false;
      let lastRejectionReason: DeferralReasonCode = 'CAPACITY_WEIGHT';

      // 1. Try to add to an existing open trip for this cluster
      for (const [, vState] of vehicleStates) {
        if (vState.vehicle.depot.toUpperCase() !== order.depot.toUpperCase()) continue;

        for (let i = 0; i < vState.trips.length; i++) {
          const trip = vState.trips[i];
          if (trip.brand.toUpperCase() === order.brand.toUpperCase() && trip.district === order.district) {
            const fitCheck = fitsInTrip(vState, i, order);
            if (fitCheck.fits) {
              trip.orders.push(order);
              const newStopCount = trip.orders.length;
              const newDistance = calculateTripDistance(trip.district, newStopCount, dtravel);
              const newFuel = calculateTripFuel(trip.district, newStopCount, vState.vehicle.km_per_l, dtravel);
              const fuelDelta = newFuel - trip.fuelLiters;
              vState.remainingFuelL -= fuelDelta;
              trip.distanceKm = newDistance;
              trip.fuelLiters = newFuel;
              allocated = true;
              break;
            } else if (fitCheck.reason) {
              lastRejectionReason = fitCheck.reason;
            }
          }
        }
        if (allocated) break;
      }

      // 2. If not placed, try to create a new trip on an available vehicle
      if (!allocated) {
        const depotVehicles = Array.from(vehicleStates.values()).filter(
          (vs) => vs.vehicle.depot.toUpperCase() === order.depot.toUpperCase()
        );
        const hasAvailableTripSlots = depotVehicles.some(
          (vs) => (vs.trips.length + (vs.vehicle.existing_trips_count || 0)) < 2
        );
        const hasFuelRemaining = depotVehicles.some(
          (vs) => vs.remainingFuelL > 5
        );
        if (depotVehicles.length > 0 && !hasAvailableTripSlots) {
          lastRejectionReason = 'TIME_BUDGET_EXCEEDED';
        } else if (depotVehicles.length > 0 && !hasFuelRemaining) {
          lastRejectionReason = 'FUEL_QUOTA_EXCEEDED';
        }

        // Preferred candidate: vehicle with matching constraints, available fuel, and least existing trips (max 2 per day)
        const candidateVehicles = Array.from(vehicleStates.values())
          .filter((vs) => {
            const existingCount = vs.vehicle.existing_trips_count || 0;
            return (
              vs.vehicle.depot.toUpperCase() === order.depot.toUpperCase() &&
              vs.trips.length + existingCount < 2 &&
              vs.remainingFuelL > 0
            );
          })
          .sort((a, b) => {
            // Prefer van for van_only, or truck for standard if available
            const aIsVan = a.vehicle.type === 'van';
            const bIsVan = b.vehicle.type === 'van';
            const orderVanOnly = (order.parking_constraint || '').toLowerCase() === 'van_only';
            if (orderVanOnly) {
              if (aIsVan && !bIsVan) return -1;
              if (!aIsVan && bIsVan) return 1;
            } else {
              // Reserve vans if truck can take standard orders
              if (!aIsVan && bIsVan) return -1;
              if (aIsVan && !bIsVan) return 1;
            }
            const aTotal = a.trips.length + (a.vehicle.existing_trips_count || 0);
            const bTotal = b.trips.length + (b.vehicle.existing_trips_count || 0);
            if (aTotal !== bTotal) return aTotal - bTotal;
            // Prefer vehicle with more remaining fuel
            return b.remainingFuelL - a.remainingFuelL;
          });

        for (const vState of candidateVehicles) {
          const check = canStartTrip(vState, order);
          if (check.canStart) {
            const existingCount = vState.vehicle.existing_trips_count || 0;
            const tripNumber = existingCount + vState.trips.length + 1;
            const tripDist = calculateTripDistance(order.district, 1, dtravel);
            const tripFuel = calculateTripFuel(order.district, 1, vState.vehicle.km_per_l, dtravel);
            vState.remainingFuelL -= tripFuel;

            vState.trips.push({
              trip_number: tripNumber,
              brand: order.brand,
              district: order.district,
              depot: order.depot,
              orders: [order],
              distanceKm: tripDist,
              fuelLiters: tripFuel,
            });
            allocated = true;
            break;
          } else if (check.reason) {
            if (
              lastRejectionReason === 'CAPACITY_WEIGHT' ||
              lastRejectionReason === 'CAPACITY_VOLUME'
            ) {
              if (
                check.reason === 'NO_REEFER_AVAILABLE' ||
                check.reason === 'NO_VAN_AVAILABLE' ||
                check.reason === 'FUEL_QUOTA_EXCEEDED'
              ) {
                lastRejectionReason = check.reason;
              }
            } else {
              lastRejectionReason = check.reason;
            }
          }
        }
      }

      // 3. If still unallocated, determine root cause deferral code
      if (!allocated) {
        const isChilled = (order.temp_requirement || '').toLowerCase() === 'chilled';
        const isVanOnly = (order.parking_constraint || '').toLowerCase() === 'van_only';

        // Check if workshop fleet shortage is the cause
        const workshopCompatible = workshopVehicles.filter(
          (wv) =>
            wv.depot.toUpperCase() === order.depot.toUpperCase() &&
            (!isChilled || wv.temp === 'reefer') &&
            (!isVanOnly || wv.type === 'van')
        );
        const activeCompatible = activeVehicles.filter(
          (av) =>
            av.depot.toUpperCase() === order.depot.toUpperCase() &&
            (!isChilled || av.temp === 'reefer') &&
            (!isVanOnly || av.type === 'van')
        );

        let finalReason: DeferralReasonCode = lastRejectionReason;

        if (isChilled && activeCompatible.length === 0 && workshopCompatible.length === 0) {
          finalReason = 'NO_REEFER_AVAILABLE';
        } else if (isVanOnly && activeCompatible.length === 0 && workshopCompatible.length === 0) {
          finalReason = 'NO_VAN_AVAILABLE';
        } else if (activeCompatible.length === 0 && workshopCompatible.length > 0) {
          finalReason = 'WORKSHOP_FLEET_SHORTAGE';
        } else if (isChilled && !activeVehicles.some((v) => v.temp === 'reefer')) {
          finalReason = 'NO_REEFER_AVAILABLE';
        } else if (isVanOnly && !activeVehicles.some((v) => v.type === 'van')) {
          finalReason = 'NO_VAN_AVAILABLE';
        } else if (
          activeCompatible.length > 0 &&
          activeCompatible.every((v) => (v.fuel_remaining_l !== undefined ? v.fuel_remaining_l <= 0 : false))
        ) {
          finalReason = 'FUEL_QUOTA_EXCEEDED';
        }

        deferred.push({
          order_id: order.order_id,
          outlet_id: order.outlet_id,
          outlet_name: order.outlet_name,
          brand: order.brand,
          district: order.district,
          depot: order.depot,
          weight: order.weight,
          volume: order.volume,
          reason_code: finalReason,
          notes: `Deferred due to ${finalReason}`,
        });
      }
    }
  }

  // Build ProposedTrip list
  const proposedTrips: ProposedTrip[] = [];
  const activeVehiclesUsed = new Set<string>();

  for (const [, vState] of vehicleStates) {
    for (const trip of vState.trips) {
      activeVehiclesUsed.add(vState.vehicle.vehicle_id);

      const totalWeight = trip.orders.reduce((sum, o) => sum + o.weight, 0);
      const totalVolume = trip.orders.reduce((sum, o) => sum + o.volume, 0);
      const dockTypes = trip.orders.map((o) => o.dock_type || 'rear_dock');
      const duration = calculateTripDuration(trip.district, trip.brand, dockTypes, dtravel, allowances);

      const stops: ProposedTripStop[] = trip.orders.map((o, idx) => ({
        order_id: o.order_id,
        outlet_id: o.outlet_id,
        outlet_name: o.outlet_name,
        sequence_number: idx + 1,
        dock_type: o.dock_type || 'rear_dock',
        weight: o.weight,
        volume: o.volume,
      }));

      proposedTrips.push({
        vehicle_id: vState.vehicle.vehicle_id,
        vehicle_type: vState.vehicle.type,
        vehicle_temp: vState.vehicle.temp,
        trip_number: trip.trip_number,
        brand: trip.brand,
        district: trip.district,
        depot: trip.depot,
        duration_minutes: duration,
        total_weight_kg: Number(totalWeight.toFixed(2)),
        total_volume_m3: Number(totalVolume.toFixed(2)),
        weight_utilization_pct: Number(((totalWeight / vState.vehicle.weight_cap_kg) * 100).toFixed(1)),
        volume_utilization_pct: Number(((totalVolume / vState.vehicle.volume_cap_m3) * 100).toFixed(1)),
        orders: trip.orders,
        stops,
        estimated_distance_km: trip.distanceKm,
        estimated_fuel_liters: trip.fuelLiters,
        fuel_remaining_after_trip_l: Number(Math.max(0, vState.remainingFuelL).toFixed(2)),
      });
    }
  }

  const plannedOrdersCount = orders.length - deferred.length;
  const fulfillmentRate = orders.length > 0 ? (plannedOrdersCount / orders.length) * 100 : 100;
  const totalWeightPlanned = proposedTrips.reduce((sum, t) => sum + t.total_weight_kg, 0);
  const totalVolumePlanned = proposedTrips.reduce((sum, t) => sum + t.total_volume_m3, 0);
  const totalFuelPlanned = proposedTrips.reduce((sum, t) => sum + (t.estimated_fuel_liters || 0), 0);

  const kpi: AllocationKPI = {
    total_orders: orders.length,
    planned_orders: plannedOrdersCount,
    deferred_orders: deferred.length,
    fulfillment_rate_pct: Number(fulfillmentRate.toFixed(1)),
    total_weight_kg: Number(totalWeightPlanned.toFixed(2)),
    total_volume_m3: Number(totalVolumePlanned.toFixed(2)),
    active_vehicles_count: activeVehiclesUsed.size,
    total_trips_count: proposedTrips.length,
    total_estimated_fuel_l: Number(totalFuelPlanned.toFixed(2)),
  };

  return {
    trips: proposedTrips,
    deferred,
    kpi,
  };
}
