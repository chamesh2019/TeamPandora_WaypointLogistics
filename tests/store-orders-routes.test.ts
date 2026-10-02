/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getOrders, POST as createOrder } from "../app/api/store/orders/route";
import { GET as getOrderById } from "../app/api/store/orders/[id]/route";
import * as guard from "../lib/api/guard";
import { StoreService } from "../lib/services/store-service";
import { apiError } from "../lib/api/response";
import type { StoreAuthContext } from "../lib/types/store-api";

describe("/api/store/orders Route Handlers", () => {
  const mockAuthContext: StoreAuthContext = {
    userId: "u1",
    username: "store1",
    role: "store_manager",
    outletId: "OUT001",
    brandId: "BRAND_FRESH",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/store/orders", () => {
    it("returns auth guard error response when authentication fails", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401)
      );

      const req = new Request("http://localhost:3000/api/store/orders");
      const res = await getOrders(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 200 with order list and pagination metadata for authenticated outlet", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "getStoreOrders").mockResolvedValue({
        orders: [
          {
            orderId: "ORD-001",
            outletId: "OUT001",
            brandId: "BRAND_FRESH",
            orderDate: "2026-10-02",
            createdAt: "2026-10-01T10:00:00Z",
            isAfterCutoff: false,
            tempRequirement: "ambient",
            orderUnits: 15,
            orderWeightKg: 200,
            orderVolumeM3: 2.5,
            lifecycleStatus: "SUBMITTED",
            consecutiveSkips: 0,
            dispatchDate: "2026-10-02",
          },
        ],
        total: 1,
      });

      const req = new Request("http://localhost:3000/api/store/orders?page=1&pageSize=10");
      const res = await getOrders(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].orderId).toBe("ORD-001");
      expect(json.meta.page).toBe(1);
      expect(json.meta.pageSize).toBe(10);
      expect(json.meta.total).toBe(1);
    });

    it("parses filter parameters and forwards them to StoreService", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      const getOrdersSpy = vi.spyOn(StoreService, "getStoreOrders").mockResolvedValue({
        orders: [],
        total: 0,
      });

      const req = new Request(
        "http://localhost:3000/api/store/orders?status=SUBMITTED&temp=chilled&startDate=2026-10-01&endDate=2026-10-05&page=2&pageSize=25"
      );
      const res = await getOrders(req);
      expect(res.status).toBe(200);
      expect(getOrdersSpy).toHaveBeenCalledWith("OUT001", {
        status: "SUBMITTED",
        temp: "chilled",
        startDate: "2026-10-01",
        endDate: "2026-10-05",
        page: 2,
        pageSize: 25,
      });
    });

    it("returns 400 when startDate or endDate query param has invalid date format", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);

      const invalidUrls = [
        "http://localhost:3000/api/store/orders?startDate=invalid-date",
        "http://localhost:3000/api/store/orders?startDate=2026/10/01",
        "http://localhost:3000/api/store/orders?startDate=2026-02-31",
        "http://localhost:3000/api/store/orders?endDate=2026-13-01",
        "http://localhost:3000/api/store/orders?endDate=bad",
      ];

      for (const url of invalidUrls) {
        const req = new Request(url);
        const res = await getOrders(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe("VALIDATION_ERROR");
        expect(json.error.message).toBe(
          "Invalid date format for startDate/endDate, expected YYYY-MM-DD"
        );
      }
    });

    it("returns 500 when StoreService throws an unexpected error", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "getStoreOrders").mockRejectedValue(new Error("Database connection lost"));

      const req = new Request("http://localhost:3000/api/store/orders");
      const res = await getOrders(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("POST /api/store/orders", () => {
    it("returns auth guard error response when unauthorized", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("FORBIDDEN_ROLE", "Forbidden: Access requires store_manager or dispatcher role", 403)
      );

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe("FORBIDDEN_ROLE");
    });

    it("returns 400 when body is invalid JSON", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: "invalid-json{",
        headers: { "Content-Type": "application/json" },
      });
      const res = await createOrder(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when required fields are missing or invalid", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);

      const invalidBodies = [
        {},
        { deliveryDate: "not-a-date", tempRequirement: "ambient", orderUnits: 10, orderWeightKg: 100, orderVolumeM3: 2 },
        { deliveryDate: "2026-10-02", tempRequirement: "hot", orderUnits: 10, orderWeightKg: 100, orderVolumeM3: 2 },
        { deliveryDate: "2026-10-02", tempRequirement: "ambient", orderUnits: 0, orderWeightKg: 100, orderVolumeM3: 2 },
        { deliveryDate: "2026-10-02", tempRequirement: "ambient", orderUnits: 10, orderWeightKg: -5, orderVolumeM3: 2 },
        { deliveryDate: "2026-10-02", tempRequirement: "ambient", orderUnits: 10, orderWeightKg: 100, orderVolumeM3: 0 },
      ];

      for (const body of invalidBodies) {
        const req = new Request("http://localhost:3000/api/store/orders", {
          method: "POST",
          body: JSON.stringify(body),
        });
        const res = await createOrder(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("returns 400 when items is not an array", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryDate: "2026-10-02",
          tempRequirement: "ambient",
          orderUnits: 10,
          orderWeightKg: 100,
          orderVolumeM3: 2,
          items: "not-an-array",
        }),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.message).toBe("items must be an array");
    });

    it("returns 400 when any item in items array is invalid", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);

      const basePayload = {
        deliveryDate: "2026-10-02",
        tempRequirement: "ambient",
        orderUnits: 10,
        orderWeightKg: 100,
        orderVolumeM3: 2,
      };

      const invalidItemArrays = [
        [null],
        ["string-item"],
        [{ skuCode: "", productName: "Valid", quantity: 5 }],
        [{ skuCode: "   ", productName: "Valid", quantity: 5 }],
        [{ skuCode: 123, productName: "Valid", quantity: 5 }],
        [{ skuCode: "SKU-1", productName: "", quantity: 5 }],
        [{ skuCode: "SKU-1", productName: "   ", quantity: 5 }],
        [{ skuCode: "SKU-1", productName: 123, quantity: 5 }],
        [{ skuCode: "SKU-1", productName: "Valid", quantity: 0 }],
        [{ skuCode: "SKU-1", productName: "Valid", quantity: -1 }],
        [{ skuCode: "SKU-1", productName: "Valid", quantity: 2.5 }],
        [{ skuCode: "SKU-1", productName: "Valid", quantity: "five" }],
        [
          { skuCode: "SKU-VALID", productName: "Good", quantity: 2 },
          { skuCode: "", productName: "Bad", quantity: 1 },
        ],
      ];

      for (const items of invalidItemArrays) {
        const req = new Request("http://localhost:3000/api/store/orders", {
          method: "POST",
          body: JSON.stringify({ ...basePayload, items }),
        });
        const res = await createOrder(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
        expect(json.error.message).toBe("Invalid item in items array");
      }
    });

    it("creates order and returns 201 with order data", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "createStoreOrder").mockResolvedValue({
        orderId: "ORD-001",
        outletId: "OUT001",
        deliveryDate: "2026-10-02",
        dispatchDate: "2026-10-02",
        tempRequirement: "ambient",
        orderUnits: 15,
        orderWeightKg: 200,
        orderVolumeM3: 2.5,
        lifecycleStatus: "SUBMITTED",
        isAfterCutoff: false,
      });

      const payload = {
        deliveryDate: "2026-10-02",
        tempRequirement: "ambient",
        orderUnits: 15,
        orderWeightKg: 200,
        orderVolumeM3: 2.5,
        notes: "Fragile items",
        items: [
          { skuCode: "SKU-1", productName: "Item 1", quantity: 5, unitWeightKg: 10, unitVolumeM3: 0.1 },
        ],
      };

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.orderId).toBe("ORD-001");
      expect(json.data.isAfterCutoff).toBe(false);
      expect(json.meta.notice).toBeUndefined();
    });

    it("returns notice in metadata when order placed after cutoff", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "createStoreOrder").mockResolvedValue({
        orderId: "ORD-002",
        outletId: "OUT001",
        deliveryDate: "2026-10-02",
        dispatchDate: "2026-10-03",
        tempRequirement: "ambient",
        orderUnits: 15,
        orderWeightKg: 200,
        orderVolumeM3: 2.5,
        lifecycleStatus: "SUBMITTED",
        isAfterCutoff: true,
        notice: "Order recorded after 4:00 PM cutoff. Scheduled for rollover to subsequent delivery run.",
      });

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryDate: "2026-10-02",
          tempRequirement: "ambient",
          orderUnits: 15,
          orderWeightKg: 200,
          orderVolumeM3: 2.5,
        }),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.isAfterCutoff).toBe(true);
      expect(json.meta.notice).toBe(
        "Order recorded after 4:00 PM cutoff. Scheduled for rollover to subsequent delivery run."
      );
    });

    it("returns 400 CHILLED_NOT_ALLOWED when non-Fresh store orders chilled", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue({
        ...mockAuthContext,
        brandId: "BRAND_STYLE",
      });
      vi.spyOn(StoreService, "createStoreOrder").mockRejectedValue(new Error("CHILLED_NOT_ALLOWED"));

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryDate: "2026-10-02",
          tempRequirement: "chilled",
          orderUnits: 15,
          orderWeightKg: 200,
          orderVolumeM3: 2.5,
        }),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("CHILLED_NOT_ALLOWED");
      expect(json.error.message).toContain("Fresh");
    });

    it("returns 409 ORDER_ALREADY_EXISTS when duplicate active order exists", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "createStoreOrder").mockRejectedValue(new Error("ORDER_ALREADY_EXISTS"));

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryDate: "2026-10-02",
          tempRequirement: "ambient",
          orderUnits: 15,
          orderWeightKg: 200,
          orderVolumeM3: 2.5,
        }),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("ORDER_ALREADY_EXISTS");
    });

    it("returns 500 when unexpected error occurs during creation", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "createStoreOrder").mockRejectedValue(new Error("Transaction deadlock"));

      const req = new Request("http://localhost:3000/api/store/orders", {
        method: "POST",
        body: JSON.stringify({
          deliveryDate: "2026-10-02",
          tempRequirement: "ambient",
          orderUnits: 15,
          orderWeightKg: 200,
          orderVolumeM3: 2.5,
        }),
      });
      const res = await createOrder(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("GET /api/store/orders/[id]", () => {
    it("returns auth guard error response when unauthorized", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401)
      );

      const req = new Request("http://localhost:3000/api/store/orders/ORD-001");
      const res = await getOrderById(req, { params: Promise.resolve({ id: "ORD-001" }) });
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 404 when order is not found", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "getStoreOrderById").mockResolvedValue(null);

      const req = new Request("http://localhost:3000/api/store/orders/ORD-NONEXIST");
      const res = await getOrderById(req, { params: Promise.resolve({ id: "ORD-NONEXIST" }) });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 when order ID parameter is missing or empty", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/store/orders/");
      const res = await getOrderById(req, { params: Promise.resolve({ id: "" }) });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });

    it("returns 200 with full order details when found", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "getStoreOrderById").mockResolvedValue({
        orderId: "ORD-001",
        outletId: "OUT001",
        brandId: "BRAND_FRESH",
        orderDate: "2026-10-02",
        createdAt: "2026-10-01T10:00:00Z",
        isAfterCutoff: false,
        tempRequirement: "ambient",
        orderUnits: 15,
        orderWeightKg: 200,
        orderVolumeM3: 2.5,
        lifecycleStatus: "PLANNED",
        consecutiveSkips: 0,
        dispatchDate: "2026-10-02",
        items: [
          {
            itemId: "item-1",
            skuCode: "SKU-1",
            productName: "Item 1",
            quantityOrdered: 15,
            quantityLoaded: 15,
            quantityDelivered: null,
            quantityReceived: null,
            unitWeightKg: 10,
            unitVolumeM3: 0.1,
            isChilled: false,
          },
        ],
        tripInfo: {
          tripId: "TRIP-01",
          tripNumber: 1,
          vehicleId: "VEH-01",
          driverName: "John Doe",
          driverPhone: "0771234567",
          plannedArrivalTime: "09:30",
          lifecycleStatus: "PLANNED",
        },
      });

      const req = new Request("http://localhost:3000/api/store/orders/ORD-001");
      const res = await getOrderById(req, { params: Promise.resolve({ id: "ORD-001" }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.orderId).toBe("ORD-001");
      expect(json.data.items).toHaveLength(1);
      expect(json.data.tripInfo.driverName).toBe("John Doe");
    });

    it("supports plain object params as well as promise params", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "getStoreOrderById").mockResolvedValue({
        orderId: "ORD-002",
        outletId: "OUT001",
        brandId: "BRAND_FRESH",
        orderDate: "2026-10-02",
        createdAt: "2026-10-01T10:00:00Z",
        isAfterCutoff: false,
        tempRequirement: "ambient",
        orderUnits: 15,
        orderWeightKg: 200,
        orderVolumeM3: 2.5,
        lifecycleStatus: "SUBMITTED",
        consecutiveSkips: 0,
        dispatchDate: "2026-10-02",
        items: [],
      });

      const req = new Request("http://localhost:3000/api/store/orders/ORD-002");
      // Passing synchronous params object
      const res = await getOrderById(req, { params: { id: "ORD-002" } } as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.orderId).toBe("ORD-002");
    });

    it("returns 500 when StoreService throws an unexpected error", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuthContext);
      vi.spyOn(StoreService, "getStoreOrderById").mockRejectedValue(new Error("DB error"));

      const req = new Request("http://localhost:3000/api/store/orders/ORD-ERR");
      const res = await getOrderById(req, { params: Promise.resolve({ id: "ORD-ERR" }) });
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });
});
