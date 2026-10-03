import { pool } from "../db";
import { getCutoffInfo } from "../utils/cutoff";
import type {
  DispatcherOrderDto,
  DispatcherOrdersResponseData,
  DispatcherOrderFilters,
  DispatcherOrderStatus,
} from "../types/dispatcher-api";

function mapLifecycleStatus(lifecycleStatus: string): DispatcherOrderStatus {
  switch (lifecycleStatus?.toUpperCase()) {
    case "SUBMITTED":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "PLANNED":
      return "Planned";
    case "LOADING":
    case "LOADED":
    case "IN_TRANSIT":
      return "Dispatched";
    case "ARRIVED":
    case "DELIVERED":
    case "RECEIVED":
      return "Delivered";
    case "DEFERRED":
      return "Deferred";
    default:
      return "Pending";
  }
}

function mapBrand(brandId: string): "Fresh" | "Style" | "Tech" {
  const upper = (brandId || "").toUpperCase();
  if (upper.includes("STYLE")) return "Style";
  if (upper.includes("TECH")) return "Tech";
  return "Fresh";
}

function formatPlaced(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return "Today";
  const day = d.getDate();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${hours}:${minutes}`;
}

export class DispatcherService {
  /**
   * Retrieves orders for the Dispatcher order queue, supporting status, brand, district, and search filters.
   */
  static async getOrders(
    filters: DispatcherOrderFilters = {}
  ): Promise<{ data: DispatcherOrdersResponseData; total: number }> {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 50));
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.brand) {
      conditions.push(`outl.brand_id = $${paramIndex++}`);
      params.push(filters.brand.toUpperCase());
    }

    if (filters.district) {
      conditions.push(`outl.district_id ILIKE $${paramIndex++}`);
      params.push(`%${filters.district}%`);
    }

    if (filters.date) {
      conditions.push(`o.order_date = $${paramIndex++}`);
      params.push(filters.date);
    }

    if (filters.status && filters.status !== "All") {
      const st = filters.status.toLowerCase();
      if (st === "pending") {
        conditions.push(`o.lifecycle_status IN ('SUBMITTED', 'CONFIRMED')`);
      } else if (st === "confirmed") {
        conditions.push(`o.lifecycle_status = 'CONFIRMED'`);
      } else if (st === "planned") {
        conditions.push(`o.lifecycle_status = 'PLANNED'`);
      } else if (st === "dispatched" || st === "in_transit") {
        conditions.push(`o.lifecycle_status IN ('LOADING', 'LOADED', 'IN_TRANSIT')`);
      } else if (st === "delivered" || st === "received") {
        conditions.push(`o.lifecycle_status IN ('ARRIVED', 'DELIVERED', 'RECEIVED')`);
      } else if (st === "deferred") {
        conditions.push(`o.lifecycle_status = 'DEFERRED'`);
      } else {
        conditions.push(`o.lifecycle_status = $${paramIndex++}`);
        params.push(filters.status.toUpperCase());
      }
    }

    if (filters.search) {
      const q = `%${filters.search.toLowerCase().trim()}%`;
      conditions.push(`(
        o.order_id ILIKE $${paramIndex} OR
        outl.outlet_id ILIKE $${paramIndex} OR
        outl.district_id ILIKE $${paramIndex} OR
        COALESCE(ts.trip_id, '') ILIKE $${paramIndex}
      )`);
      params.push(q);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    try {
      const dataQuery = `
        SELECT 
          o.order_id,
          o.outlet_id,
          outl.brand_id,
          outl.district_id,
          outl.contact_name,
          o.order_date,
          o.created_at,
          o.is_after_cutoff,
          o.temp_requirement,
          o.order_units,
          o.order_weight_kg,
          o.order_volume_m3,
          o.priority_score,
          o.lifecycle_status,
          ts.trip_id
        FROM orders o
        JOIN outlets outl ON o.outlet_id = outl.outlet_id
        LEFT JOIN trip_stops ts ON o.order_id = ts.order_id
        WHERE ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      const countQuery = `
        SELECT COUNT(*) as count
        FROM orders o
        JOIN outlets outl ON o.outlet_id = outl.outlet_id
        LEFT JOIN trip_stops ts ON o.order_id = ts.order_id
        WHERE ${whereClause}
      `;

      const summaryQuery = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN o.is_after_cutoff = FALSE THEN 1 END) as pre_cutoff_count,
          COUNT(CASE WHEN o.is_after_cutoff = TRUE THEN 1 END) as post_cutoff_count,
          COUNT(CASE WHEN o.lifecycle_status IN ('CONFIRMED', 'PLANNED', 'LOADING', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'RECEIVED') THEN 1 END) as confirmed_count
        FROM orders o
      `;

      const [dataRes, countRes, summaryRes] = await Promise.all([
        pool.query(dataQuery, [...params, pageSize, offset]),
        pool.query(countQuery, params),
        pool.query(summaryQuery),
      ]);

      const orders: DispatcherOrderDto[] = (dataRes.rows || []).map((r: any) => {
        const brand = mapBrand(r.brand_id);
        const storeName = `${r.district_id || "Colombo"} ${brand}`;
        const weightKg = Number(r.order_weight_kg || 0);
        const volumeM3 = Number(r.order_volume_m3 || 0);

        return {
          id: r.order_id,
          orderId: r.order_id,
          outletId: r.outlet_id,
          store: storeName,
          brand,
          district: r.district_id || "Colombo",
          items: Number(r.order_units || 0),
          weight: `${weightKg} kg`,
          weightKg,
          volume: `${volumeM3.toFixed(1)} m³`,
          volumeM3,
          trip: r.trip_id || "—",
          tripId: r.trip_id || null,
          placed: formatPlaced(r.created_at),
          createdAt: typeof r.created_at === "object" ? r.created_at?.toISOString() : String(r.created_at),
          deliveryDate: typeof r.order_date === "object" ? r.order_date?.toISOString().split("T")[0] : String(r.order_date),
          isAfterCutoff: Boolean(r.is_after_cutoff),
          priorityScore: Number(r.priority_score || 0),
          status: mapLifecycleStatus(r.lifecycle_status),
          lifecycleStatus: r.lifecycle_status,
          tempRequirement: r.temp_requirement || "ambient",
        };
      });

      const total = countRes.rows && countRes.rows[0] ? parseInt(countRes.rows[0].count, 10) : orders.length;

      const summaryRow = summaryRes.rows && summaryRes.rows[0];
      const summary = {
        preCutoffCount: summaryRow ? parseInt(summaryRow.pre_cutoff_count, 10) : 0,
        postCutoffCount: summaryRow ? parseInt(summaryRow.post_cutoff_count, 10) : 0,
        confirmedCount: summaryRow ? parseInt(summaryRow.confirmed_count, 10) : 0,
        totalOrders: summaryRow ? parseInt(summaryRow.total_count, 10) : total,
        cutoffInfo: getCutoffInfo(),
      };

      return {
        data: {
          orders,
          summary,
        },
        total,
      };
    } catch (err) {
      // In offline / mock test environments without database, return fallback structure
      return {
        data: {
          orders: [],
          summary: {
            preCutoffCount: 0,
            postCutoffCount: 0,
            confirmedCount: 0,
            totalOrders: 0,
            cutoffInfo: getCutoffInfo(),
          },
        },
        total: 0,
      };
    }
  }
}
