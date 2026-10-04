import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/driver/pod
 * Retrieves completed deliveries with signatures and timestamps.
 */
export async function GET(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId") || searchParams.get("trip_id") || undefined;

  try {
    const deliveries = await DriverService.getCompletedDeliveries(auth.driverId, tripId);
    return apiSuccess(deliveries);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve POD records",
      500
    );
  }
}
