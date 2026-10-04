import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/loader/manifests/[id]
 * Returns trip loading manifest with stops in reverse LIFO sequence (load_sequence ASC).
 */
export async function GET(
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
    const manifest = await LoaderService.getTripManifest(tripId, auth.depotId);
    if (!manifest) {
      return apiError("NOT_FOUND", `Loading manifest for trip ${tripId} not found`, 404);
    }
    return apiSuccess(manifest);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve loading manifest",
      500
    );
  }
}
