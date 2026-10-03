import { requireDispatcher } from "@/lib/api/guard";
import { DispatcherService } from "@/lib/services/dispatcher-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { DispatcherOrderFilters } from "@/lib/types/dispatcher-api";

function isValidDateParam(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * GET /api/dispatcher/orders
 * Retrieves filtered, paginated order queue and cutoff metrics for Dispatchers.
 */
export async function GET(request: Request) {
  const auth = await requireDispatcher(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const url = new URL(request.url, "http://localhost:3000");
    const searchParams = url.searchParams;

    const status = searchParams.get("status") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const district = searchParams.get("district") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const dateParam = searchParams.get("date") || undefined;

    if (dateParam !== undefined && !isValidDateParam(dateParam)) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid date format for date param, expected YYYY-MM-DD",
        400
      );
    }

    const pageRaw = searchParams.get("page");
    const pageSizeRaw = searchParams.get("pageSize");

    const parsedPage = pageRaw ? parseInt(pageRaw, 10) : 1;
    const parsedPageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 50;

    const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const pageSize =
      isNaN(parsedPageSize) || parsedPageSize < 1
        ? 50
        : Math.min(100, parsedPageSize);

    const filters: DispatcherOrderFilters = {
      status,
      brand,
      district,
      search,
      date: dateParam,
      page,
      pageSize,
    };

    const result = await DispatcherService.getOrders(filters);

    return apiSuccess(result.data, 200, {
      page,
      pageSize,
      total: result.total,
    });
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve orders",
      500
    );
  }
}
