import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/loader/reports
 * Returns weekly loading statistics and daily trend logs for the loader's depot.
 */
export async function GET(request: Request) {
  const auth = await requireLoader(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const reports = await LoaderService.getReports(auth.depotId);
    return apiSuccess(reports);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve loader reports",
      500
    );
  }
}
