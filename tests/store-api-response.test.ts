import { describe, it, expect } from "vitest";
import { apiSuccess, apiError } from "../lib/api/response";

describe("API Response Envelope Helpers", () => {
  it("formats successful response with default 200 status", async () => {
    const res = apiSuccess({ orderId: "ORD-123" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ orderId: "ORD-123" });
    expect(body.meta.timestamp).toBeDefined();
  });

  it("formats successful response with custom status and meta", async () => {
    const res = apiSuccess(
      { orderId: "ORD-CREATED" },
      201,
      { page: 1, pageSize: 10, total: 1, notice: "Order accepted" }
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ orderId: "ORD-CREATED" });
    expect(body.meta.page).toBe(1);
    expect(body.meta.pageSize).toBe(10);
    expect(body.meta.total).toBe(1);
    expect(body.meta.notice).toBe("Order accepted");
    expect(body.meta.timestamp).toBeDefined();
  });

  it("formats error response with code, message and custom status", async () => {
    const res = apiError("CHILLED_NOT_ALLOWED", "Only Fresh stores can order chilled", 400);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("CHILLED_NOT_ALLOWED");
    expect(body.error.message).toBe("Only Fresh stores can order chilled");
  });

  it("formats error response with details when provided", async () => {
    const res = apiError(
      "VALIDATION_ERROR",
      "Invalid payload",
      422,
      { field: "deliveryDate", reason: "Cannot be past date" }
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Invalid payload");
    expect(body.error.details).toEqual({
      field: "deliveryDate",
      reason: "Cannot be past date",
    });
  });
});
