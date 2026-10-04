import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { SubmitPodInput } from "@/lib/types/driver-api";

/**
 * POST /api/driver/stops/[id]/pod
 * Submits Proof of Delivery (POD) [FORM-DRV-03].
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { id: stopId } = await props.params;
  if (!stopId) {
    return apiError("INVALID_PARAMETERS", "Missing stopId parameter", 400);
  }

  let body: SubmitPodInput;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Invalid JSON request body", 400);
  }

  if (!body.recipientName || body.recipientName.trim().length < 2) {
    return apiError(
      "INVALID_PARAMETERS",
      "recipientName is required and must be at least 2 characters",
      400
    );
  }

  if (!body.signatureUrl || body.signatureUrl.trim() === "") {
    return apiError(
      "INVALID_PARAMETERS",
      "signatureUrl is required for proof of delivery",
      400
    );
  }

  try {
    const result = await DriverService.submitPod(
      stopId,
      auth.driverId,
      body
    );
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "POD_FAILED",
      error instanceof Error ? error.message : "Failed to submit proof of delivery",
      400
    );
  }
}
