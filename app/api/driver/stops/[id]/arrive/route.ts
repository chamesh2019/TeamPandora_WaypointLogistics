import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { StopArrivalInput } from "@/lib/types/driver-api";

/**
 * POST /api/driver/stops/[id]/arrive
 * Stop Arrival Check-In [FORM-DRV-02].
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

  let body: StopArrivalInput = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional for simple arrival check-in
  }

  try {
    const result = await DriverService.recordArrival(
      stopId,
      auth.driverId,
      body
    );
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "ARRIVAL_FAILED",
      error instanceof Error ? error.message : "Failed to record stop arrival",
      400
    );
  }
}
