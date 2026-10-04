import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/driver/stops
 * Returns sequenced delivery stops for active or specified trip.
 */
export async function GET(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  let tripId = searchParams.get("tripId") || searchParams.get("trip_id");

  if (!tripId) {
    // If tripId is not specified, resolve from active trip
    const active = await DriverService.getActiveTrip(auth.driverId);
    if (!active || !active.trip) {
      return apiSuccess({ tripId: null, stops: [] });
    }
    tripId = active.trip.tripId;
  }

  try {
    const stops = await DriverService.getStops(tripId);
    return apiSuccess({ tripId, stops });
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve stops",
      500
    );
  }
}
