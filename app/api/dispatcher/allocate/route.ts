import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';
import { requireDispatcher } from '../../../../lib/api/guard';
import {
  solveAllocation,
  type SolverOrderInput,
  type SolverVehicleInput,
} from '../../../../lib/services/allocation-solver';
import { validateAllocation } from '../../../../lib/services/allocation-validator';

export async function POST(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

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

    // 1. If orders are provided in request body, use them directly
    if (Array.isArray(body.orders) && body.orders.length > 0) {
      const orderIds = body.orders
        .map((o: any) => o.orderId || o.order_id || o.id)
        .filter(Boolean);

      const dbOutletsMap = new Map<string, string>();
      if (orderIds.length > 0) {
        try {
          const dbOrdersRes = await pool.query(
            `SELECT order_id, outlet_id FROM orders WHERE order_id = ANY($1::varchar[])`,
            [orderIds]
          );
          for (const row of dbOrdersRes.rows) {
            dbOutletsMap.set(row.order_id, row.outlet_id);
          }
        } catch {}
      }

      orders = body.orders.map((o: any) => {
        const orderId = o.orderId || o.order_id || o.id;
        const outletId =
          dbOutletsMap.get(orderId) ||
          o.outlet_id ||
          o.outletId ||
          (o.outlet && typeof o.outlet === 'string' ? o.outlet : undefined);

        return {
          order_id: orderId,
          outlet_id: outletId,
          outlet_name: o.store || o.outlet_name || outletId,
          brand: String(o.brand || 'Fresh').toUpperCase().replace('BRAND_', ''),
          district: o.district || 'Colombo',
          depot: o.depot || depot_id || 'PELIYAGODA',
          temp_requirement: (o.temp_requirement || o.temperature || 'ambient').toLowerCase(),
          parking_constraint: o.parking_constraint || o.parkingConstraint || 'normal',
          dock_type: o.dock_type || o.dockType || 'rear_dock',
          weight: Number(o.weightKg ?? o.weight ?? 0),
          volume: Number(o.volumeM3 ?? o.volume ?? 0),
          deferred_yesterday: Boolean(o.deferred_yesterday || o.deferredYesterday),
          days_since_last_served: Number(o.days_since_last_served || o.daysSinceLastServed || o.priorityScore || 1),
        };
      });
    }

    // 2. Query vehicles and existing trip counts, and query DB orders if not supplied in body
    try {
      if (orders.length === 0) {
        let orderQuery = `
          SELECT 
            o.order_id,
            o.outlet_id,
            ot.outlet_id as outlet_name,
            ot.brand_id as brand,
            ot.district_id as district,
            ot.depot_id as depot,
            o.temp_requirement,
            ot.parking_constraint,
            ot.dock_type,
            o.order_weight_kg as weight,
            o.order_volume_m3 as volume,
            o.deferred_yesterday,
            o.days_since_last_served
          FROM orders o
          JOIN outlets ot ON o.outlet_id = ot.outlet_id
          WHERE (o.dispatch_date = $1 OR o.order_date <= $1)
            AND o.lifecycle_status IN ('SUBMITTED', 'CONFIRMED')
            AND NOT EXISTS (SELECT 1 FROM trip_stops ts WHERE ts.order_id = o.order_id)
        `;
        const orderParams: any[] = [plan_date];
        if (depot_id && depot_id !== 'ALL') {
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
            deferred_yesterday: Boolean(r.deferred_yesterday),
            days_since_last_served: Number(r.days_since_last_served || 1),
          }));
        }
      }

      // Query existing trips for plan_date to enforce max 2 trips per vehicle limit
      let tripCountMap = new Map<string, number>();
      try {
        const existingTripsRes = await pool.query(
          `SELECT t.vehicle_id, COUNT(*) as trip_count
           FROM trips t
           JOIN allocation_plans ap ON t.plan_id = ap.plan_id
           WHERE ap.plan_date = $1
           GROUP BY t.vehicle_id`,
          [plan_date]
        );
        for (const row of existingTripsRes.rows) {
          tripCountMap.set(row.vehicle_id, parseInt(row.trip_count, 10));
        }
      } catch {
        // Fallback if trips query fails
      }

      let vehicleQuery = `
        SELECT 
          v.vehicle_id, 
          v.type, 
          v.temp, 
          v.weight_cap_kg, 
          v.volume_cap_m3, 
          v.fuel_type,
          v.km_per_l,
          v.weekly_fuel_quota_l,
          v.depot_id as depot, 
          v.status,
          COALESCE(fl.used_this_week_liters, 0) AS fuel_used_l
        FROM vehicles v
        LEFT JOIN (
          SELECT 
            vehicle_id,
            SUM(fuel_consumed_liters) AS used_this_week_liters
          FROM vehicle_fuel_ledgers
          WHERE iso_year = EXTRACT(ISOYEAR FROM CURRENT_DATE) 
            AND iso_week = EXTRACT(WEEK FROM CURRENT_DATE)
          GROUP BY vehicle_id
        ) fl ON v.vehicle_id = fl.vehicle_id
      `;
      const vehicleParams: any[] = [];
      if (depot_id && depot_id !== 'ALL') {
        vehicleQuery += ` WHERE v.depot_id = $1`;
        vehicleParams.push(depot_id);
      }

      const vehicleRes = await pool.query(vehicleQuery, vehicleParams);
      if (vehicleRes.rows.length > 0) {
        fleet = vehicleRes.rows.map((r) => {
          const quota = Number(r.weekly_fuel_quota_l || 350);
          const fuelUsed = Number(r.fuel_used_l || 0);
          const fuelRemaining = Math.max(0, quota - fuelUsed);
          return {
            vehicle_id: r.vehicle_id,
            type: r.type,
            temp: r.temp,
            weight_cap_kg: Number(r.weight_cap_kg),
            volume_cap_m3: Number(r.volume_cap_m3),
            depot: r.depot,
            status: r.status,
            km_per_l: Number(r.km_per_l || 5.0),
            weekly_fuel_quota_l: quota,
            fuel_remaining_l: fuelRemaining,
            existing_trips_count: tripCountMap.get(r.vehicle_id) || 0,
          };
        });
      }
    } catch (dbErr) {
      console.warn('Database query failed in allocate route:', dbErr);
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
