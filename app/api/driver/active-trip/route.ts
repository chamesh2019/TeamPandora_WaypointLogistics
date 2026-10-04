import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/driver/active-trip
 * Returns active trip details, vehicle telematics, and stops progress for the authenticated driver.
 */
export async function GET(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const data = await DriverService.getActiveTrip(auth.driverId);
    return apiSuccess(data);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve active trip",
      500
    );
  }
}
