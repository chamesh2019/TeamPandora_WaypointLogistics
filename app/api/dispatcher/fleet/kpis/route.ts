import { NextResponse } from "next/server";
import { requireDispatcher } from "../../../../../lib/api/guard";
import { apiSuccess, apiError } from "../../../../../lib/api/response";
import { DispatcherService } from "../../../../../lib/services/dispatcher-service";

export async function GET(request: Request) {
  try {
    const authResult = await requireDispatcher(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const depotId = searchParams.get("depotId") || authResult.depotId || undefined;
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 10;

    const data = await DispatcherService.getFleetKpis({
      depotId,
      days,
    });

    return apiSuccess(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve fleet KPIs";
    return apiError("INTERNAL_ERROR", message, 500);
  }
}
