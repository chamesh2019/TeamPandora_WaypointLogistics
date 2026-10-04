export interface DistrictTravel {
  depot_to_district_freeflow_min: number;
  inter_stop_freeflow_min: number;
  depot_to_district_km?: number;
  inter_stop_km?: number;
}

export interface VehicleInput {
  vehicle_id: string;
  type: string; // 'truck' | 'van'
  temp: string; // 'ambient' | 'reefer'
  weight_cap_kg: number;
  volume_cap_m3: number;
  depot: string; // 'PELIYAGODA' | 'KANDY'
  status?: string; // 'available' | 'in_workshop' | etc.
}

export interface OrderInput {
  order_id: string;
  brand: string; // 'FRESH' | 'STYLE' | 'TECH'
  district: string;
  depot: string;
  temp_requirement?: string; // 'ambient' | 'chilled'
  parking_constraint?: string; // 'none' | 'van_only'
  dock_type?: string; // 'rear_dock' | 'street' | 'mall_bay'
  weight: number;
  volume: number;
}

export interface TripValidationInput {
  vehicle: VehicleInput;
  orders: OrderInput[];
  tripNumber?: number;
  brand?: string;
  district?: string;
}

export interface FullAllocationPlanInput {
  plan_date: string;
  trips: Array<{
    vehicle: VehicleInput;
    tripNumber: number;
    brand: string;
    district: string;
    orders: OrderInput[];
  }>;
}

export interface ReferenceData {
  districtTravel: Record<string, DistrictTravel>;
  serviceAllowances: Record<string, number>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const FLOAT_EPSILON = 1e-6;

/**
 * Deterministic Trip Duration Calculator:
 * trip_minutes = outbound_travel + inter_stop_travel + total_handling_time
 */
export function calculateTripDuration(
  district: string,
  brand: string,
  dockTypes: string[],
  dtravel: Record<string, DistrictTravel>,
  allowance: Record<string, number>
): number {
  const numStops = dockTypes.length;
  if (numStops === 0) {
    return 0;
  }

  const travelInfo = dtravel[district] || {
    depot_to_district_freeflow_min: 0,
    inter_stop_freeflow_min: 0,
  };

  const outbound = travelInfo.depot_to_district_freeflow_min;
  const interStop = (numStops - 1) * travelInfo.inter_stop_freeflow_min;

  let handling = 0;
  const brandKey = brand.toUpperCase();
  for (const dock of dockTypes) {
    const key = `${brandKey}:${dock}`;
    handling += allowance[key] ?? 0;
  }

  return outbound + interStop + handling;
}

/**
 * Validates feasibility rules for a single proposed trip:
 * 1. Brand & District Isolation
 * 2. Refrigeration Requirement
 * 3. Vehicle Access (van_only)
 * 4. Home Depot Boundary
 * 5. Weight & Volume Capacity Limits (with 1e-6 epsilon)
 */
export function validateTripFeasibility(trip: TripValidationInput): ValidationResult {
  const errors: string[] = [];
  const { vehicle, orders } = trip;

  if (orders.length === 0) {
    return { isValid: true, errors: [] };
  }

  // 1. Brand Isolation
  const brands = new Set(orders.map((o) => o.brand.toUpperCase()));
  if (brands.size > 1) {
    errors.push(`Trip for vehicle ${vehicle.vehicle_id} carries mixed brands: ${Array.from(brands).join(', ')}`);
  }

  // 2. District Isolation
  const districts = new Set(orders.map((o) => o.district));
  if (districts.size > 1) {
    errors.push(`Trip for vehicle ${vehicle.vehicle_id} carries mixed districts: ${Array.from(districts).join(', ')}`);
  }

  // 3. Home Depot Boundary
  for (const order of orders) {
    if (order.depot && vehicle.depot && order.depot.toUpperCase() !== vehicle.depot.toUpperCase()) {
      errors.push(
        `Order ${order.order_id} depot mismatch: order depot is ${order.depot} but vehicle ${vehicle.vehicle_id} is stationed at ${vehicle.depot}`
      );
    }
  }

  // 4. Refrigeration Constraint
  const hasChilled = orders.some((o) => (o.temp_requirement || '').toLowerCase() === 'chilled');
  if (hasChilled && (vehicle.temp || '').toLowerCase() !== 'reefer') {
    errors.push('carries chilled orders on a non-refrigerated vehicle');
  }

  // 5. Vehicle Access Constraint (parking constraint van_only)
  const hasVanOnly = orders.some((o) => (o.parking_constraint || '').toLowerCase() === 'van_only');
  if (hasVanOnly && (vehicle.type || '').toLowerCase() !== 'van') {
    errors.push('sends a truck to a van_only outlet');
  }

  // 6. Capacity Constraints (Weight and Volume)
  const totalWeight = orders.reduce((sum, o) => sum + (o.weight || 0), 0);
  const totalVolume = orders.reduce((sum, o) => sum + (o.volume || 0), 0);

  if (totalWeight > vehicle.weight_cap_kg + FLOAT_EPSILON) {
    errors.push(
      `Trip weight capacity exceeded for vehicle ${vehicle.vehicle_id}: total ${totalWeight.toFixed(2)} kg exceeds capacity ${vehicle.weight_cap_kg} kg`
    );
  }

  if (totalVolume > vehicle.volume_cap_m3 + FLOAT_EPSILON) {
    errors.push(
      `Trip volume capacity exceeded for vehicle ${vehicle.vehicle_id}: total ${totalVolume.toFixed(2)} m3 exceeds capacity ${vehicle.volume_cap_m3} m3`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a complete daily allocation plan across all vehicles:
 * - Max 2 trips per vehicle per day
 * - In-workshop vehicles cannot be assigned
 * - Individual trip feasibility
 * - Fresh operating window (max 270 min) & daytime budget (max 480 min)
 */
export function validateFullAllocationPlan(
  plan: FullAllocationPlanInput,
  refData?: ReferenceData
): ValidationResult {
  const errors: string[] = [];
  const vehicleTripsMap = new Map<string, FullAllocationPlanInput['trips']>();

  for (const trip of plan.trips) {
    const vId = trip.vehicle.vehicle_id;
    if (!vehicleTripsMap.has(vId)) {
      vehicleTripsMap.set(vId, []);
    }
    vehicleTripsMap.get(vId)!.push(trip);

    // Workshop status check
    if (trip.vehicle.status === 'in_workshop') {
      errors.push(`Vehicle ${vId} is currently in_workshop and cannot be assigned to trips`);
    }

    // Single trip feasibility
    const singleTripResult = validateTripFeasibility({
      vehicle: trip.vehicle,
      orders: trip.orders,
      tripNumber: trip.tripNumber,
      brand: trip.brand,
      district: trip.district,
    });
    errors.push(...singleTripResult.errors);

    // Trip duration validation if reference data available
    if (refData && trip.orders.length > 0) {
      const dockTypes = trip.orders.map((o) => o.dock_type || 'rear_dock');
      const duration = calculateTripDuration(
        trip.district,
        trip.brand,
        dockTypes,
        refData.districtTravel,
        refData.serviceAllowances
      );

      const brandUpper = trip.brand.toUpperCase();
      if (brandUpper === 'FRESH' && duration > 270) {
        errors.push(
          `Fresh trip for vehicle ${vId} (Trip ${trip.tripNumber}) exceeds maximum budget of 270 minutes (calculated: ${duration} min)`
        );
      } else if ((brandUpper === 'STYLE' || brandUpper === 'TECH') && duration > 480) {
        errors.push(
          `${brandUpper} trip for vehicle ${vId} (Trip ${trip.tripNumber}) exceeds maximum budget of 480 minutes (calculated: ${duration} min)`
        );
      }
    }
  }

  // Daily trip count per vehicle (Max 2 trips per vehicle per day)
  for (const [vehicleId, trips] of vehicleTripsMap.entries()) {
    if (trips.length > 2) {
      errors.push(
        `Vehicle ${vehicleId} has ${trips.length} assigned trips, which exceeds maximum 2 trips per day`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const validateAllocation = validateFullAllocationPlan;
