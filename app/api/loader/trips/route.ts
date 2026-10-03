import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/loader/trips
 * Returns list of trips staged or loading at the loader's depot.
 */
export async function GET(request: Request) {
  const auth = await requireLoader(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const trips = await LoaderService.getActiveTrips(auth.depotId);
    return apiSuccess(trips);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve active trips",
      500
    );
  }
}
