import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/store/overview
 * Retrieves aggregated dashboard KPIs, alerts, and recent orders for the store manager's outlet.
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const overview = await StoreService.getStoreOverview(auth.outletId);
    return apiSuccess(overview);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve store overview",
      500
    );
  }
}
