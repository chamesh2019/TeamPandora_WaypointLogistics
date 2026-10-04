import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { OfflineEventDto } from "@/lib/types/driver-api";

/**
 * POST /api/driver/sync
 * Synchronizes an array of buffered offline events [Section 6 Offline Sync Protocol].
 */
export async function POST(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  let body: { events: OfflineEventDto[] };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Invalid JSON request body", 400);
  }

  if (!Array.isArray(body.events)) {
    return apiError(
      "INVALID_PARAMETERS",
      "Request body must contain an 'events' array",
      400
    );
  }

  try {
    const result = await DriverService.syncOfflineQueue(auth.driverId, body.events);
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "SYNC_FAILED",
      error instanceof Error ? error.message : "Failed to synchronize offline events",
      500
    );
  }
}
