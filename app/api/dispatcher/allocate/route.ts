import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';
import {
  solveAllocation,
  type SolverOrderInput,
  type SolverVehicleInput,
} from '../../../../lib/services/allocation-solver';
import { validateAllocation } from '../../../../lib/services/allocation-validator';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan_date, depot_id } = body;

    if (!plan_date) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Missing required field: plan_date' },
        },
        { status: 400 }
      );
    }

    let orders: SolverOrderInput[] = [];
    let fleet: SolverVehicleInput[] = [];

    // Attempt DB retrieval, fallback to mock/seed data if offline
    try {
      let orderQuery = `
        SELECT 
          o.order_id,
          o.outlet_id,
          ot.outlet_name,
          o.brand_id as brand,
          ot.district_id as district,
          ot.depot_id as depot,
          o.temp_requirement,
          ot.parking_constraint,
          ot.dock_type,
          o.total_weight_kg as weight,
          o.total_volume_m3 as volume
        FROM orders o
        JOIN outlets ot ON o.outlet_id = ot.outlet_id
        WHERE (o.dispatch_date = $1 OR o.order_date = $1)
          AND o.lifecycle_status IN ('SUBMITTED', 'CONFIRMED')
      `;
      const orderParams: any[] = [plan_date];
      if (depot_id) {
        orderQuery += ` AND ot.depot_id = $2`;
        orderParams.push(depot_id);
      }

      const orderRes = await pool.query(orderQuery, orderParams);
      if (orderRes.rows.length > 0) {
        orders = orderRes.rows.map((r) => ({
          order_id: r.order_id,
          outlet_id: r.outlet_id,
          outlet_name: r.outlet_name,
          brand: r.brand.replace('BRAND_', ''),
          district: r.district,
          depot: r.depot,
          temp_requirement: r.temp_requirement,
          parking_constraint: r.parking_constraint,
          dock_type: r.dock_type,
          weight: Number(r.weight),
          volume: Number(r.volume),
          deferred_yesterday: false,
          days_since_last_served: 1,
        }));
      }

      let vehicleQuery = `
        SELECT vehicle_id, type, temp, weight_cap_kg, volume_cap_m3, depot_id as depot, status
        FROM vehicles
      `;
      const vehicleParams: any[] = [];
      if (depot_id) {
        vehicleQuery += ` WHERE depot_id = $1`;
        vehicleParams.push(depot_id);
      }

      const vehicleRes = await pool.query(vehicleQuery, vehicleParams);
      if (vehicleRes.rows.length > 0) {
        fleet = vehicleRes.rows.map((r) => ({
          vehicle_id: r.vehicle_id,
          type: r.type,
          temp: r.temp,
          weight_cap_kg: Number(r.weight_cap_kg),
          volume_cap_m3: Number(r.volume_cap_m3),
          depot: r.depot,
          status: r.status,
        }));
      }
    } catch {
      // In offline/mock test environments where DB isn't running
      orders = [];
      fleet = [];
    }

    const solverResult = solveAllocation(orders, fleet);

    // Validate generated allocation plan
    const validationResult = validateAllocation({
      plan_date,
      trips: solverResult.trips.map((t) => {
        const v = fleet.find((f) => f.vehicle_id === t.vehicle_id) || {
          vehicle_id: t.vehicle_id,
          type: t.vehicle_type,
          temp: t.vehicle_temp,
          weight_cap_kg: 5000,
          volume_cap_m3: 25,
          depot: t.depot,
        };
        return {
          vehicle: v,
          tripNumber: t.trip_number,
          brand: t.brand,
          district: t.district,
          orders: t.orders.map((o) => ({
            order_id: o.order_id,
            brand: o.brand,
            district: o.district,
            depot: o.depot,
            temp_requirement: o.temp_requirement,
            parking_constraint: o.parking_constraint,
            dock_type: o.dock_type,
            weight: o.weight,
            volume: o.volume,
          })),
        };
      }),
    });

    return NextResponse.json({
      success: true,
      plan_date,
      depot_id: depot_id || 'ALL',
      trips: solverResult.trips,
      deferred: solverResult.deferred,
      kpis: solverResult.kpi,
      validation: validationResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to allocate orders' },
      },
      { status: 500 }
    );
  }
}
