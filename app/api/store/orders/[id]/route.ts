import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * GET /api/store/orders/[id]
 * Retrieves single order details including ordered items and trip delivery info.
 * Strictly scoped to the authenticated user's outlet.
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  const params = await Promise.resolve(context?.params);
  const orderId = params?.id;

  if (!orderId || typeof orderId !== "string" || orderId.trim() === "") {
    return apiError("NOT_FOUND", "Order not found", 404);
  }

  try {
    const order = await StoreService.getStoreOrderById(
      auth.outletId,
      orderId.trim()
    );

    if (!order) {
      return apiError("NOT_FOUND", "Order not found", 404);
    }

    return apiSuccess(order);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve order",
      500
    );
  }
}
