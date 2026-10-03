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
    const date = searchParams.get("date") || undefined;
    const depotId = searchParams.get("depotId") || authResult.depotId || undefined;
    const status = searchParams.get("status") || undefined;

    const trips = await DispatcherService.getTrips({
      date,
      depotId,
      status,
    });

    return apiSuccess({ trips });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve trips";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}
