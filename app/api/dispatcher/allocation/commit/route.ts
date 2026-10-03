import { NextResponse } from "next/server";
import { requireDispatcher } from "../../../../../lib/api/guard";
import { apiSuccess, apiError } from "../../../../../lib/api/response";
import { DispatcherService } from "../../../../../lib/services/dispatcher-service";
import type { CommitAllocationTripPayload } from "../../../../../lib/types/dispatcher-api";

export async function POST(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = (await request.json().catch(() => null)) as CommitAllocationTripPayload | null;
    if (!body) {
      return apiError("INVALID_PAYLOAD", "Request body must be valid JSON", 400);
    }

    const { vehicleId, driverId, tripNumber, orderIds, planDate, depotId } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return apiError(
        "INVALID_ORDERS",
        "At least one order must be selected for assignment",
        400
      );
    }

    if (!vehicleId || typeof vehicleId !== "string") {
      return apiError("INVALID_VEHICLE", "A valid vehicleId is required", 400);
    }

    if (!driverId || typeof driverId !== "string") {
      return apiError("INVALID_DRIVER", "A valid driverId is required", 400);
    }

    if (tripNumber !== 1 && tripNumber !== 2) {
      return apiError(
        "INVALID_TRIP_NUMBER",
        "tripNumber must be 1 or 2 (maximum 2 trips per vehicle per day)",
        400
      );
    }

    const result = await DispatcherService.commitTripAssignment(
      {
        vehicleId,
        driverId,
        tripNumber,
        orderIds,
        planDate,
        depotId: depotId || authResult.depotId,
      },
      authResult
    );

    return apiSuccess(result, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to commit trip assignment";
    return apiError("ALLOCATION_ERROR", message, 422);
  }
}
