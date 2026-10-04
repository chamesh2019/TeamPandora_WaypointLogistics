import { NextResponse } from "next/server";
import { requireDispatcher } from "../../../../lib/api/guard";
import { apiSuccess, apiError } from "../../../../lib/api/response";
import { DispatcherService } from "../../../../lib/services/dispatcher-service";

export async function GET(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get("depotId") || authResult.depotId || undefined;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await DispatcherService.getFleet({
      depotId,
      status,
      type,
      search,
    });

    return apiSuccess(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve fleet";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json().catch(() => ({}));
    const { vehicleId, status, driverId } = body;

    if (!vehicleId) {
      return apiError("BAD_REQUEST", "vehicleId is required", 400);
    }

    const result = await DispatcherService.updateFleetVehicle(vehicleId, {
      status,
      driverId,
    });

    return apiSuccess(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update fleet vehicle";
    if (
      message.includes("Cannot send vehicle to workshop") ||
      message.includes("not found") ||
      message.includes("required")
    ) {
      return apiError("BAD_REQUEST", message, 400);
    }
    return apiError("INTERNAL_ERROR", message, 500);
  }
}
