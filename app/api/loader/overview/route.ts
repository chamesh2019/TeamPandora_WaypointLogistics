import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/loader/overview
 * Returns dashboard KPIs, active bay assignments, and recent notifications for the loader's depot.
 */
export async function GET(request: Request) {
  const auth = await requireLoader(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const overview = await LoaderService.getOverview(auth.depotId);
    return apiSuccess(overview);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve loader overview",
      500
    );
  }
}
