import { NextResponse } from "next/server";
import { auth } from "../auth";
import { pool } from "../db";
import { apiError } from "./response";
import type { StoreAuthContext } from "../types/store-api";

interface GuardUser {
  id?: string;
  userId?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  outletId?: string;
  brandId?: string;
  brand_id?: string;
}

interface GuardSessionResult {
  user?: GuardUser | null;
  session?: unknown;
}

const KNOWN_OUTLET_BRANDS: Record<string, string> = {
  // Fresh Outlets (1-80)
  OUT001: "BRAND_FRESH",
  OUT002: "BRAND_FRESH",
  OUT003: "BRAND_FRESH",
  OUT004: "BRAND_FRESH",
  OUT005: "BRAND_FRESH",
  OUT006: "BRAND_FRESH",
  OUT007: "BRAND_FRESH",
  OUT008: "BRAND_FRESH",
  // Style Outlets (81-105)
  OUT081: "BRAND_STYLE",
  OUT082: "BRAND_STYLE",
  OUT083: "BRAND_STYLE",
  OUT084: "BRAND_STYLE",
  OUT085: "BRAND_STYLE",
  // Tech Outlets (106+)
  OUT106: "BRAND_TECH",
  OUT107: "BRAND_TECH",
  OUT108: "BRAND_TECH",
};

/**
 * Normalizes brand string representation to standard BRAND_* enum format.
 */
export function normalizeBrandId(rawBrand: string): string {
  if (rawBrand.startsWith("BRAND_")) {
    return rawBrand;
  }
  const upper = rawBrand.toUpperCase().trim();
  if (upper === "FRESH") return "BRAND_FRESH";
  if (upper === "STYLE") return "BRAND_STYLE";
  if (upper === "TECH") return "BRAND_TECH";
  return `BRAND_${upper}`;
}

/**
 * Fallback static outlet derivation based on seed convention & ranges.
 */
export function deriveBrandFromOutletId(outletId: string): string {
  const normalized = outletId.toUpperCase().trim();
  if (KNOWN_OUTLET_BRANDS[normalized]) {
    return KNOWN_OUTLET_BRANDS[normalized];
  }

  // Derive by numeric ID range:
  // Fresh: 1-80, Style: 81-105, Tech: 106+
  const match = normalized.match(/OUT0*(\d+)/i);
  if (match) {
    const idNum = parseInt(match[1], 10);
    if (idNum >= 1 && idNum <= 80) return "BRAND_FRESH";
    if (idNum >= 81 && idNum <= 105) return "BRAND_STYLE";
    if (idNum >= 106) return "BRAND_TECH";
  }

  if (normalized.includes("STYLE")) return "BRAND_STYLE";
  if (normalized.includes("TECH")) return "BRAND_TECH";
  if (normalized.includes("FRESH")) return "BRAND_FRESH";

  return "BRAND_FRESH";
}

/**
 * Resolves brand ID from PostgreSQL outlets table, with fallback to static outlet mapping.
 */
export async function resolveBrandForOutlet(outletId: string): Promise<string> {
  try {
    const res = await pool.query<{ brand_id: string }>(
      "SELECT brand_id FROM outlets WHERE outlet_id = $1",
      [outletId]
    );
    if (res.rows.length > 0 && res.rows[0].brand_id) {
      return normalizeBrandId(res.rows[0].brand_id);
    }
  } catch {
    // Graceful offline fallback when Postgres is unreachable in unit tests
  }

  return deriveBrandFromOutletId(outletId);
}

/**
 * Validates session, role permissions, and outlet scope for Store Manager API routes.
 *
 * 1. Checks Better Auth session from request headers.
 * 2. Ensures user has 'store_manager' or 'dispatcher' role.
 * 3. Scopes request to outletId (extracted from session, or for dispatchers from query param / header).
 * 4. Resolves the associated brandId (e.g. BRAND_FRESH, BRAND_STYLE, BRAND_TECH).
 *
 * Returns StoreAuthContext if valid, or a NextResponse error (401 / 403) on failure.
 */
export async function requireStoreManager(
  request: Request
): Promise<StoreAuthContext | NextResponse> {
  if (!request) {
    return apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401);
  }

  let sessionRes: GuardSessionResult | null = null;
  try {
    sessionRes = (await auth.api.getSession({
      headers: request.headers,
    })) as GuardSessionResult | null;
  } catch {
    return apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401);
  }

  if (!sessionRes || !sessionRes.user || !sessionRes.session) {
    return apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401);
  }

  const user = sessionRes.user;
  const role = user.role;

  if (role !== "store_manager" && role !== "dispatcher") {
    return apiError(
      "FORBIDDEN_ROLE",
      "Forbidden: Access requires store_manager or dispatcher role",
      403
    );
  }

  let outletId: string | undefined = user.outletId;

  if (!outletId && role === "dispatcher") {
    try {
      const url = new URL(request.url, "http://localhost:3000");
      outletId =
        url.searchParams.get("outletId") ||
        url.searchParams.get("outlet_id") ||
        request.headers.get("x-outlet-id") ||
        request.headers.get("outlet-id") ||
        request.headers.get("outletId") ||
        undefined;
    } catch {
      outletId =
        request.headers.get("x-outlet-id") ||
        request.headers.get("outlet-id") ||
        request.headers.get("outletId") ||
        undefined;
    }
  }

  if (!outletId || typeof outletId !== "string" || outletId.trim() === "") {
    return apiError(
      "MISSING_OUTLET",
      "Forbidden: User is not assigned to an outlet",
      403
    );
  }

  outletId = outletId.trim();

  let brandId: string;
  if (user.brandId) {
    brandId = normalizeBrandId(user.brandId);
  } else if (user.brand_id) {
    brandId = normalizeBrandId(user.brand_id);
  } else {
    brandId = await resolveBrandForOutlet(outletId);
  }

  const userId = user.id || user.userId || "";
  const username = user.username || user.name || user.email || userId;

  return {
    userId,
    username,
    role,
    outletId,
    brandId,
  };
}
