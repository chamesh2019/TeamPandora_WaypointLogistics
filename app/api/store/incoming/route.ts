import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/store/incoming
 * Retrieves scheduled and in-transit incoming deliveries for the authenticated store manager's outlet.
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const deliveries = await StoreService.getStoreIncoming(auth.outletId);
    return apiSuccess(deliveries);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve incoming deliveries",
      500
    );
  }
}
