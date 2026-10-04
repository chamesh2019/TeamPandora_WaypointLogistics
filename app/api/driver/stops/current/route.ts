import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/driver/stops/current
 * Returns immediate current and next stops for driver navigation and arrival.
 */
export async function GET(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  let tripId = searchParams.get("tripId") || searchParams.get("trip_id");

  if (!tripId) {
    const active = await DriverService.getActiveTrip(auth.driverId);
    if (!active || !active.trip) {
      return apiSuccess({
        tripId: null,
        currentStop: null,
        nextStop: null,
        completedStopsCount: 0,
        remainingStopsCount: 0,
      });
    }
    tripId = active.trip.tripId;
  }

  try {
    const data = await DriverService.getCurrentStop(tripId);
    return apiSuccess(data);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve current stop",
      500
    );
  }
}
