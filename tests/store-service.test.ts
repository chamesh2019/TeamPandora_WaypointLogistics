import { describe, it, expect, vi, beforeEach } from "vitest";
import { StoreService } from "../lib/services/store-service";
import { pool } from "../lib/db";

describe("Store Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Cutoff Logic (checkIsAfterCutoff)", () => {
    it("calculates is_after_cutoff correctly based on 16:00 cutoff", () => {
      const morningDate = new Date("2026-10-01T10:00:00+05:30");
      const eveningDate = new Date("2026-10-01T16:30:00+05:30");
      expect(StoreService.checkIsAfterCutoff(morningDate)).toBe(false);
      expect(StoreService.checkIsAfterCutoff(eveningDate)).toBe(true);
    });

    it("evaluates cutoff boundary at exact 16:00:00 as true", () => {
      const exactCutoff = new Date("2026-10-01T16:00:00+05:30");
      const justBeforeCutoff = new Date("2026-10-01T15:59:59+05:30");
      expect(StoreService.checkIsAfterCutoff(exactCutoff)).toBe(true);
      expect(StoreService.checkIsAfterCutoff(justBeforeCutoff)).toBe(false);
    });
  });

  describe("Order Rules Validation (validateOrderRules)", () => {
    it("validates that non-Fresh stores cannot order chilled items", async () => {
      await expect(
        StoreService.validateOrderRules("OUT085", "BRAND_STYLE", {
          deliveryDate: "2026-10-02",
          tempRequirement: "chilled",
          orderUnits: 20,
          orderWeightKg: 100,
          orderVolumeM3: 2,
        })
      ).rejects.toThrow("CHILLED_NOT_ALLOWED");

      await expect(
        StoreService.validateOrderRules("OUT106", "BRAND_TECH", {
          deliveryDate: "2026-10-02",
          tempRequirement: "chilled",
          orderUnits: 15,
          orderWeightKg: 80,
          orderVolumeM3: 1.5,
        })
      ).rejects.toThrow("CHILLED_NOT_ALLOWED");
    });

    it("allows Fresh stores to order chilled items", async () => {
      vi.spyOn(pool, "query").mockResolvedValue({ rows: [], rowCount: 0 } as any);
      await expect(
        StoreService.validateOrderRules("OUT001", "BRAND_FRESH", {
          deliveryDate: "2026-10-02",
          tempRequirement: "chilled",
          orderUnits: 20,
          orderWeightKg: 100,
          orderVolumeM3: 2,
        })
      ).resolves.toBeUndefined();
    });

    it("throws ORDER_ALREADY_EXISTS if an active order exists for same date and temp requirement", async () => {
      vi.spyOn(pool, "query").mockResolvedValue({
        rows: [{ order_id: "ORD-001" }],
        rowCount: 1,
      } as any);

      await expect(
        StoreService.validateOrderRules("OUT001", "BRAND_FRESH", {
          deliveryDate: "2026-10-02",
          tempRequirement: "ambient",
          orderUnits: 50,
          orderWeightKg: 200,
          orderVolumeM3: 3,
        })
      ).rejects.toThrow("ORDER_ALREADY_EXISTS");
    });
  });

  describe("Order Operations", () => {
    it("creates a store order within transaction and calculates cutoff dispatchDate", async () => {
      const mockClient = {
        query: vi.fn().mockImplementation((queryText: string) => {
          if (queryText === "BEGIN" || queryText === "COMMIT") {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes("SELECT order_id FROM orders")) {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes("INSERT INTO orders")) {
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          if (queryText.includes("INSERT INTO order_items")) {
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          return Promise.resolve({ rows: [], rowCount: 0 });
        }),
        release: vi.fn(),
      };
      vi.spyOn(pool, "query").mockResolvedValue({ rows: [], rowCount: 0 } as any);
      vi.spyOn(pool, "connect").mockResolvedValue(mockClient as any);

      const created = await StoreService.createStoreOrder("OUT001", "BRAND_FRESH", {
        deliveryDate: "2026-10-05",
        tempRequirement: "chilled",
        orderUnits: 10,
        orderWeightKg: 50,
        orderVolumeM3: 1,
        items: [
          {
            skuCode: "SKU-01",
            productName: "Fresh Milk",
            quantity: 10,
            unitWeightKg: 5,
            unitVolumeM3: 0.1,
            isChilled: true,
          },
        ],
      });

      expect(created).toBeDefined();
      expect(created.orderId).toContain("ORD-OUT001-");
      expect(created.outletId).toBe("OUT001");
      expect(created.tempRequirement).toBe("chilled");
      expect(created.lifecycleStatus).toBe("SUBMITTED");
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("gets store orders with filters and total count", async () => {
      vi.spyOn(pool, "query")
        .mockResolvedValueOnce({
          rows: [
            {
              order_id: "ORD-1",
              outlet_id: "OUT001",
              brand_id: "BRAND_FRESH",
              order_date: "2026-10-01",
              created_at: "2026-10-01T08:00:00Z",
              is_after_cutoff: false,
              temp_requirement: "ambient",
              order_units: 20,
              order_weight_kg: "120.50",
              order_volume_m3: "1.800",
              lifecycle_status: "SUBMITTED",
              consecutive_skips: 0,
              dispatch_date: "2026-10-01",
            },
          ],
          rowCount: 1,
        } as any)
        .mockResolvedValueOnce({
          rows: [{ count: "1" }],
          rowCount: 1,
        } as any);

      const result = await StoreService.getStoreOrders("OUT001", {
        status: "SUBMITTED",
        page: 1,
        pageSize: 10,
      });

      expect(result.total).toBe(1);
      expect(result.orders.length).toBe(1);
      expect(result.orders[0].orderId).toBe("ORD-1");
      expect(result.orders[0].orderUnits).toBe(20);
    });

    it("gets store order by id with items and trip details", async () => {
      vi.spyOn(pool, "query")
        .mockResolvedValueOnce({
          rows: [
            {
              order_id: "ORD-1",
              outlet_id: "OUT001",
              brand_id: "BRAND_FRESH",
              order_date: "2026-10-01",
              created_at: "2026-10-01T08:00:00Z",
              is_after_cutoff: false,
              temp_requirement: "ambient",
              order_units: 20,
              order_weight_kg: "120.50",
              order_volume_m3: "1.800",
              lifecycle_status: "CONFIRMED",
              consecutive_skips: 0,
              dispatch_date: "2026-10-01",
              notes: "Fragile goods",
              trip_id: "TRIP-1",
              trip_number: 1,
              vehicle_id: "VEH-1",
              driver_name: "Nimal",
              driver_phone: "0771234567",
              planned_arrival_time: "09:30",
              trip_status: "IN_TRANSIT",
            },
          ],
          rowCount: 1,
        } as any)
        .mockResolvedValueOnce({
          rows: [
            {
              item_id: "ITEM-1",
              sku_code: "SKU-01",
              product_name: "Biscuits",
              quantity_ordered: 20,
              quantity_loaded: 20,
              quantity_delivered: null,
              quantity_received: null,
              unit_weight_kg: "6.00",
              unit_volume_m3: "0.0900",
              is_chilled: false,
            },
          ],
          rowCount: 1,
        } as any);

      const order = await StoreService.getStoreOrderById("OUT001", "ORD-1");
      expect(order).not.toBeNull();
      expect(order?.orderId).toBe("ORD-1");
      expect(order?.items.length).toBe(1);
      expect(order?.tripInfo?.driverName).toBe("Nimal");
    });
  });

  describe("Receipts & Discrepancies", () => {
    it("confirms receipt with ACCEPTED_IN_FULL and updates order status to RECEIVED", async () => {
      const mockClient = {
        query: vi.fn().mockImplementation((queryText: string) => {
          if (queryText === "BEGIN" || queryText === "COMMIT") {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes("SELECT lifecycle_status FROM orders")) {
            return Promise.resolve({
              rows: [{ lifecycle_status: "DELIVERED" }],
              rowCount: 1,
            });
          }
          if (queryText.includes("INSERT INTO receipt_confirmations")) {
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          if (queryText.includes("UPDATE orders SET lifecycle_status = 'RECEIVED'")) {
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          return Promise.resolve({ rows: [], rowCount: 0 });
        }),
        release: vi.fn(),
      };
      vi.spyOn(pool, "connect").mockResolvedValue(mockClient as any);

      const result = await StoreService.confirmStoreReceipt("OUT001", "usr-1", {
        orderId: "ORD-1",
        decision: "ACCEPTED_IN_FULL",
        receiverNotes: "All items intact",
      });

      expect(result.receiptId).toContain("RCP-");
      expect(result.status).toBe("ACCEPTED_IN_FULL");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("rejects receipt confirmation if order is not delivered or wrong outlet", async () => {
      const mockClient = {
        query: vi.fn().mockImplementation((queryText: string) => {
          if (queryText === "BEGIN" || queryText === "ROLLBACK") {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes("SELECT lifecycle_status FROM orders")) {
            return Promise.resolve({
              rows: [{ lifecycle_status: "IN_TRANSIT" }],
              rowCount: 1,
            });
          }
          return Promise.resolve({ rows: [], rowCount: 0 });
        }),
        release: vi.fn(),
      };
      vi.spyOn(pool, "connect").mockResolvedValue(mockClient as any);

      await expect(
        StoreService.confirmStoreReceipt("OUT001", "usr-1", {
          orderId: "ORD-1",
          decision: "ACCEPTED_IN_FULL",
        })
      ).rejects.toThrow("INVALID_ORDER_STATE");
    });
  });

  describe("Disputes & Claims", () => {
    it("creates store claim and updates order lifecycle status to DISPUTED", async () => {
      const mockClient = {
        query: vi.fn().mockImplementation((queryText: string) => {
          if (queryText === "BEGIN" || queryText === "COMMIT") {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          if (queryText.includes("SELECT lifecycle_status FROM orders")) {
            return Promise.resolve({
              rows: [{ lifecycle_status: "DELIVERED" }],
              rowCount: 1,
            });
          }
          if (queryText.includes("INSERT INTO disputes")) {
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          if (queryText.includes("UPDATE orders SET lifecycle_status = 'DISPUTED'")) {
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          if (queryText.includes("SELECT full_name FROM users")) {
            return Promise.resolve({
              rows: [{ full_name: "Manager Anura" }],
              rowCount: 1,
            });
          }
          return Promise.resolve({ rows: [], rowCount: 0 });
        }),
        release: vi.fn(),
      };
      vi.spyOn(pool, "connect").mockResolvedValue(mockClient as any);

      const claim = await StoreService.createStoreClaim("OUT001", "usr-1", {
        orderId: "ORD-1",
        disputeType: "DAMAGED",
        unitsAffected: 3,
        storeNotes: "Crushed cartons on arrival",
        evidencePhotoUrls: ["https://example.com/photo1.jpg"],
      });

      expect(claim.disputeId).toContain("DSP-");
      expect(claim.orderId).toBe("ORD-1");
      expect(claim.unitsAffected).toBe(3);
      expect(claim.resolutionStatus).toBe("OPEN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("Incoming, Deferrals, Reports & Overview", () => {
    it("gets store incoming deliveries", async () => {
      vi.spyOn(pool, "query").mockResolvedValueOnce({
        rows: [
          {
            order_id: "ORD-1",
            order_date: "2026-10-01",
            lifecycle_status: "IN_TRANSIT",
            trip_id: "TRIP-1",
            trip_number: 1,
            trip_status: "IN_TRANSIT",
            vehicle_id: "VEH-1",
            vehicle_type: "truck",
            vehicle_temp: "ambient",
            driver_name: "Nimal Fernando",
            driver_phone: "0771122334",
            planned_arrival_time: "10:30",
            actual_arrival_time: null,
            is_late: false,
          },
        ],
        rowCount: 1,
      } as any);

      const incoming = await StoreService.getStoreIncoming("OUT001");
      expect(incoming.length).toBe(1);
      expect(incoming[0].tripId).toBe("TRIP-1");
      expect(incoming[0].vehicleType).toBe("truck");
    });

    it("gets store deferrals", async () => {
      vi.spyOn(pool, "query").mockResolvedValueOnce({
        rows: [
          {
            deferral_id: "DEF-1",
            order_id: "ORD-5",
            outlet_id: "OUT001",
            order_date: "2026-10-01",
            temp_requirement: "chilled",
            order_units: 30,
            order_weight_kg: "250.00",
            order_volume_m3: "2.100",
            reason_code: "CAPACITY_WEIGHT",
            reason_notes: "Weight exceeded",
            priority_boost: 1,
            recorded_at: "2026-10-01T06:00:00Z",
            consecutive_skips: 1,
          },
        ],
        rowCount: 1,
      } as any);

      const deferrals = await StoreService.getStoreDeferrals("OUT001");
      expect(deferrals.length).toBe(1);
      expect(deferrals[0].reasonCode).toBe("CAPACITY_WEIGHT");
    });

    it("gets store reports metrics", async () => {
      vi.spyOn(pool, "query")
        .mockResolvedValueOnce({
          rows: [
            {
              total_orders: "10",
              served_orders: "9",
              delivered_orders: "9",
              on_time_stops: "8",
              total_stops: "9",
              total_units: "150",
              total_volume: "12.450",
              disputed_orders: "1",
              max_consecutive_skips: "0",
            },
          ],
          rowCount: 1,
        } as any)
        .mockResolvedValueOnce({
          rows: [
            {
              week_label: "W40",
              orders_placed: "5",
              orders_served: "5",
              orders_deferred: "0",
              volume_m3: "6.2",
            },
          ],
          rowCount: 1,
        } as any);

      const reports = await StoreService.getStoreReports("OUT001", 30);
      expect(reports.fulfillmentRate).toBe(90);
      expect(reports.weeklyTrends.length).toBe(1);
    });

    it("gets store overview aggregating KPIs, next arrival and recent orders", async () => {
      vi.spyOn(pool, "query")
        .mockResolvedValueOnce({
          rows: [{ active_orders: "3", pending_receipts: "1", active_disputes: "0" }],
          rowCount: 1,
        } as any)
        .mockResolvedValueOnce({
          rows: [
            {
              order_id: "ORD-1",
              vehicle_id: "VEH-1",
              vehicle_type: "truck",
              driver_name: "Nimal",
              driver_phone: "0770001122",
              eta: "11:00",
              is_late: false,
              status: "IN_TRANSIT",
            },
          ],
          rowCount: 1,
        } as any)
        .mockResolvedValueOnce({
          rows: [],
          rowCount: 0,
        } as any)
        .mockResolvedValueOnce({
          rows: [],
          rowCount: 0,
        } as any);

      const overview = await StoreService.getStoreOverview("OUT001");
      expect(overview.kpis.activeOrdersCount).toBe(3);
      expect(overview.kpis.nextArrival?.vehicleId).toBe("VEH-1");
      expect(Array.isArray(overview.recentOrders)).toBe(true);
    });
  });
});
