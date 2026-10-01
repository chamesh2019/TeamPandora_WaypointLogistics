import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/store/reports
 * Retrieves fulfillment and volume metrics for the store manager's outlet.
 * Accepts optional query parameter `range` ("7d" | "30d" | "90d", defaults to "30d").
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const url = new URL(request.url, "http://localhost:3000");
    const rangeParam = url.searchParams.get("range");

    let days = 30;
    if (rangeParam === "7d") {
      days = 7;
    } else if (rangeParam === "90d") {
      days = 90;
    }

    const reports = await StoreService.getStoreReports(auth.outletId, days);
    return apiSuccess(reports);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve store reports",
      500
    );
  }
}
