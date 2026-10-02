import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/store/deferrals
 * Retrieves deferral notices and explanation codes for the store manager's outlet.
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const deferrals = await StoreService.getStoreDeferrals(auth.outletId);
    return apiSuccess(deferrals);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve deferrals",
      500
    );
  }
}
