import { NextResponse } from "next/server";
import { requireDispatcher } from "../../../../lib/api/guard";
import { apiSuccess, apiError } from "../../../../lib/api/response";
import { DispatcherService } from "../../../../lib/services/dispatcher-service";

/**
 * GET /api/dispatcher/overview
 * Returns operational summary KPIs, unallocated order planning queue,
 * live exceptions, and depot/vehicle metadata for the Dispatcher Control Tower.
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get("depotId") || authResult.depotId || undefined;

    const data = await DispatcherService.getOverview({
      depotId,
    });

    return apiSuccess(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve dispatcher overview";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}
