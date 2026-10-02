import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * POST /api/loader/manifests/[id]/verify
 * Marks trip manifest as verified/signed off and updates trip status to LOADING/LOADED.
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireLoader(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { id: tripId } = await props.params;
  if (!tripId) {
    return apiError("INVALID_PARAMETERS", "Missing tripId parameter", 400);
  }

  try {
    const result = await LoaderService.verifyManifest(tripId, auth.userId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to verify manifest",
      500
    );
  }
}
