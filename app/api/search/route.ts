import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url, "http://localhost:3000");
    const q = url.searchParams.get("q")?.trim() || "";

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        data: { orders: [], trips: [] },
      });
    }

    const likeQuery = `%${q}%`;
    let orders: Array<{ id: string; title: string; subtitle: string; href: string }> = [];
    let trips: Array<{ id: string; title: string; subtitle: string; href: string }> = [];

    // Query matching orders
    try {
      const ordersRes = await pool.query(
        `SELECT o.order_id, o.outlet_id, o.brand_id, o.lifecycle_status
         FROM orders o
         WHERE o.order_id ILIKE $1 OR o.outlet_id ILIKE $1
         ORDER BY o.created_at DESC
         LIMIT 6`,
        [likeQuery]
      );

      orders = ordersRes.rows.map((row) => ({
        id: row.order_id,
        title: row.order_id,
        subtitle: `${row.brand_id ? String(row.brand_id).toUpperCase() : "Order"} · ${row.outlet_id} · ${row.lifecycle_status || "PENDING"}`,
        href: `/dispatcher/orders?search=${encodeURIComponent(row.order_id)}`,
      }));
    } catch {
      // Fallback if DB is temporarily unreachable
      if (q.toUpperCase().startsWith("ORD") || q.toUpperCase().includes("ORD")) {
        orders = [
          {
            id: q.toUpperCase(),
            title: q.toUpperCase(),
            subtitle: "Search matching order",
            href: `/dispatcher/orders?search=${encodeURIComponent(q)}`,
          },
        ];
      }
    }

    // Query matching trips
    try {
      const tripsRes = await pool.query(
        `SELECT t.trip_id, t.vehicle_id, t.status, t.district_id
         FROM trips t
         WHERE t.trip_id ILIKE $1 OR t.vehicle_id ILIKE $1 OR t.district_id ILIKE $1
         LIMIT 6`,
        [likeQuery]
      );

      trips = tripsRes.rows.map((row) => ({
        id: row.trip_id,
        title: row.trip_id,
        subtitle: `${row.vehicle_id || "Vehicle"} · ${row.district_id || ""} · ${row.status || "PLANNED"}`,
        href: `/dispatcher/trip-planning?search=${encodeURIComponent(row.trip_id)}`,
      }));
    } catch {
      // Fallback if DB is temporarily unreachable
      if (q.toUpperCase().startsWith("TRP") || q.toUpperCase().includes("TRP")) {
        trips = [
          {
            id: q.toUpperCase(),
            title: q.toUpperCase(),
            subtitle: "Search matching trip",
            href: `/dispatcher/trip-planning?search=${encodeURIComponent(q)}`,
          },
        ];
      }
    }

    return NextResponse.json({
      success: true,
      data: { orders, trips },
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({
      success: true,
      data: { orders: [], trips: [] },
    });
  }
}
