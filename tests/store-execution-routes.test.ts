/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getIncoming } from "../app/api/store/incoming/route";
import { GET as getReceipts, POST as postReceipt } from "../app/api/store/receipts/route";
import { GET as getClaims, POST as postClaim } from "../app/api/store/claims/route";
import * as guard from "../lib/api/guard";
import { StoreService } from "../lib/services/store-service";
import { apiError } from "../lib/api/response";
import type { StoreAuthContext } from "../lib/types/store-api";

describe("Store Execution Routes (Incoming, Receipts, Claims)", () => {
  const mockAuth: StoreAuthContext = {
    userId: "u1",
    username: "store1",
    role: "store_manager",
    outletId: "OUT001",
    brandId: "BRAND_FRESH",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------
  // GET /api/store/incoming
  // -------------------------------------------------------------
  describe("GET /api/store/incoming", () => {
    it("returns auth guard error response when unauthorized", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401)
      );

      const res = await getIncoming(new Request("http://localhost:3000/api/store/incoming"));
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("GET /api/store/incoming returns 200 with delivery list", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreIncoming").mockResolvedValue([
        {
          orderId: "ORD-001",
          orderDate: "2026-10-02",
          lifecycleStatus: "IN_TRANSIT",
          tripId: "TRIP-101",
          tripNumber: 1,
          tripStatus: "IN_TRANSIT",
          vehicleId: "VEH-1",
          vehicleType: "truck",
          vehicleTemp: "reefer",
          driverName: "Saman Perera",
          driverPhone: "+94771234567",
          plannedArrivalTime: "07:30",
          actualArrivalTime: null,
          isLate: false,
          lateAlert: false,
        },
      ]);

      const res = await getIncoming(new Request("http://localhost:3000/api/store/incoming"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].orderId).toBe("ORD-001");
      expect(json.data[0].tripId).toBe("TRIP-101");
    });

    it("returns 500 when StoreService.getStoreIncoming throws", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreIncoming").mockRejectedValue(
        new Error("Database connection failure")
      );

      const res = await getIncoming(new Request("http://localhost:3000/api/store/incoming"));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  // -------------------------------------------------------------
  // GET & POST /api/store/receipts
  // -------------------------------------------------------------
  describe("/api/store/receipts", () => {
    describe("GET /api/store/receipts", () => {
      it("returns auth guard error response when unauthorized", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
          apiError("FORBIDDEN_ROLE", "Forbidden: Access requires store_manager or dispatcher role", 403)
        );

        const res = await getReceipts(new Request("http://localhost:3000/api/store/receipts"));
        expect(res.status).toBe(403);
        const json = await res.json();
        expect(json.error.code).toBe("FORBIDDEN_ROLE");
      });

      it("returns 200 with pending receipts for outlet", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "getStoreReceipts").mockResolvedValue([
          {
            orderId: "ORD-002",
            outletId: "OUT001",
            orderDate: "2026-10-01",
            podId: "POD-001",
            deliveredAt: "2026-10-01T08:30:00Z",
            recipientName: "Kamal",
            signatureUrl: "https://example.com/sig.png",
            photoUrls: ["https://example.com/p1.png"],
            driverNotes: "Left at bay 2",
            driverName: "Saman Perera",
          },
        ]);

        const res = await getReceipts(new Request("http://localhost:3000/api/store/receipts"));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toHaveLength(1);
        expect(json.data[0].orderId).toBe("ORD-002");
      });

      it("returns 500 when StoreService.getStoreReceipts throws", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "getStoreReceipts").mockRejectedValue(
          new Error("DB error")
        );

        const res = await getReceipts(new Request("http://localhost:3000/api/store/receipts"));
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
      });
    });

    describe("POST /api/store/receipts", () => {
      it("returns auth guard error response when unauthorized", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
          apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401)
        );

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify({ orderId: "ORD-1", decision: "ACCEPTED_IN_FULL" }),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(401);
      });

      it("returns 400 when body is invalid JSON", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: "invalid-json{",
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when body is not an object", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify("string-body"),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when orderId is missing or empty", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const invalidBodies = [
          { decision: "ACCEPTED_IN_FULL" },
          { orderId: "", decision: "ACCEPTED_IN_FULL" },
          { orderId: "   ", decision: "ACCEPTED_IN_FULL" },
          { orderId: 123, decision: "ACCEPTED_IN_FULL" },
        ];

        for (const body of invalidBodies) {
          const req = new Request("http://localhost:3000/api/store/receipts", {
            method: "POST",
            body: JSON.stringify(body),
          });
          const res = await postReceipt(req);
          expect(res.status).toBe(400);
          const json = await res.json();
          expect(json.error.code).toBe("VALIDATION_ERROR");
        }
      });

      it("returns 400 when decision is invalid", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const invalidBodies = [
          { orderId: "ORD-1" },
          { orderId: "ORD-1", decision: "INVALID_DECISION" },
          { orderId: "ORD-1", decision: "accepted_in_full" },
          { orderId: "ORD-1", decision: 123 },
        ];

        for (const body of invalidBodies) {
          const req = new Request("http://localhost:3000/api/store/receipts", {
            method: "POST",
            body: JSON.stringify(body),
          });
          const res = await postReceipt(req);
          expect(res.status).toBe(400);
          const json = await res.json();
          expect(json.error.code).toBe("VALIDATION_ERROR");
        }
      });

      it("returns 400 when receiverNotes is not a string", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            decision: "ACCEPTED_IN_FULL",
            receiverNotes: 12345,
          }),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
      });

      it("POST /api/store/receipts signs off delivery", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        const confirmSpy = vi.spyOn(StoreService, "confirmStoreReceipt").mockResolvedValue({
          receiptId: "RCP-1",
          status: "ACCEPTED_IN_FULL",
        });

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify({ orderId: "ORD-1", decision: "ACCEPTED_IN_FULL" }),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.receiptId).toBe("RCP-1");
        expect(json.data.status).toBe("ACCEPTED_IN_FULL");
        expect(confirmSpy).toHaveBeenCalledWith("OUT001", "u1", {
          orderId: "ORD-1",
          decision: "ACCEPTED_IN_FULL",
          receiverNotes: undefined,
        });
      });

      it("signs off delivery with REPORT_DISCREPANCY and receiverNotes", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        const confirmSpy = vi.spyOn(StoreService, "confirmStoreReceipt").mockResolvedValue({
          receiptId: "RCP-2",
          status: "REPORT_DISCREPANCY",
        });

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            decision: "REPORT_DISCREPANCY",
            receiverNotes: "Missing 1 carton",
          }),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(confirmSpy).toHaveBeenCalledWith("OUT001", "u1", {
          orderId: "ORD-1",
          decision: "REPORT_DISCREPANCY",
          receiverNotes: "Missing 1 carton",
        });
      });

      it("returns 400 when StoreService throws INVALID_ORDER_STATE", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "confirmStoreReceipt").mockRejectedValue(
          new Error("INVALID_ORDER_STATE")
        );

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify({ orderId: "ORD-1", decision: "ACCEPTED_IN_FULL" }),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe("INVALID_ORDER_STATE");
      });

      it("returns 500 when StoreService throws unexpected error", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "confirmStoreReceipt").mockRejectedValue(
          new Error("Database write failure")
        );

        const req = new Request("http://localhost:3000/api/store/receipts", {
          method: "POST",
          body: JSON.stringify({ orderId: "ORD-1", decision: "ACCEPTED_IN_FULL" }),
        });
        const res = await postReceipt(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
      });
    });
  });

  // -------------------------------------------------------------
  // GET & POST /api/store/claims
  // -------------------------------------------------------------
  describe("/api/store/claims", () => {
    describe("GET /api/store/claims", () => {
      it("returns auth guard error response when unauthorized", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
          apiError("UNAUTHORIZED", "Unauthorized", 401)
        );

        const res = await getClaims(new Request("http://localhost:3000/api/store/claims"));
        expect(res.status).toBe(401);
      });

      it("returns 200 with claims list for outlet", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "getStoreClaims").mockResolvedValue([
          {
            disputeId: "DSP-001",
            orderId: "ORD-001",
            itemId: "ITEM-1",
            disputeType: "DAMAGED",
            unitsAffected: 3,
            storeNotes: "Damaged during transit",
            evidencePhotoUrls: ["https://example.com/photo.jpg"],
            resolutionStatus: "OPEN",
            resolutionNotes: null,
            resolvedAt: null,
            createdAt: "2026-10-01T12:00:00Z",
            reportedByName: "Store Manager",
          },
        ]);

        const res = await getClaims(new Request("http://localhost:3000/api/store/claims"));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toHaveLength(1);
        expect(json.data[0].disputeId).toBe("DSP-001");
      });

      it("returns 500 when StoreService.getStoreClaims throws", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "getStoreClaims").mockRejectedValue(
          new Error("DB failure")
        );

        const res = await getClaims(new Request("http://localhost:3000/api/store/claims"));
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
      });
    });

    describe("POST /api/store/claims", () => {
      it("returns auth guard error response when unauthorized", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
          apiError("UNAUTHORIZED", "Unauthorized", 401)
        );

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify({}),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(401);
      });

      it("returns 400 when body is invalid JSON", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: "not-json{",
        });
        const res = await postClaim(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when body is not an object", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify(12345),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("VALIDATION_ERROR");
      });

      it("returns 400 when required fields are missing or invalid", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);

        const invalidBodies = [
          // Missing orderId
          { disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "notes" },
          { orderId: "", disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "notes" },
          { orderId: 123, disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "notes" },
          // Invalid itemId
          { orderId: "ORD-1", itemId: 123, disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "notes" },
          // Invalid disputeType
          { orderId: "ORD-1", disputeType: "UNKNOWN", unitsAffected: 2, storeNotes: "notes" },
          { orderId: "ORD-1", unitsAffected: 2, storeNotes: "notes" },
          // Invalid unitsAffected
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 0, storeNotes: "notes" },
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: -1, storeNotes: "notes" },
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: "two", storeNotes: "notes" },
          { orderId: "ORD-1", disputeType: "DAMAGED", storeNotes: "notes" },
          // Missing or empty storeNotes
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 2 },
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "" },
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "   " },
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 2, storeNotes: 123 },
          // Invalid evidencePhotoUrls
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "notes", evidencePhotoUrls: "not-an-array" },
          { orderId: "ORD-1", disputeType: "DAMAGED", unitsAffected: 2, storeNotes: "notes", evidencePhotoUrls: [123] },
        ];

        for (const body of invalidBodies) {
          const req = new Request("http://localhost:3000/api/store/claims", {
            method: "POST",
            body: JSON.stringify(body),
          });
          const res = await postClaim(req);
          expect(res.status).toBe(400);
          const json = await res.json();
          expect(json.error.code).toBe("VALIDATION_ERROR");
        }
      });

      it("POST /api/store/claims files dispute and returns 201", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        const claimSpy = vi.spyOn(StoreService, "createStoreClaim").mockResolvedValue({
          disputeId: "DSP-1",
          orderId: "ORD-1",
          itemId: null,
          disputeType: "DAMAGED",
          unitsAffected: 2,
          storeNotes: "Two boxes crushed during unloading",
          evidencePhotoUrls: ["https://example.com/crushed.jpg"],
          resolutionStatus: "OPEN",
          resolutionNotes: null,
          resolvedAt: null,
          createdAt: "2026-10-01T12:00:00Z",
          reportedByName: "Store Manager",
        });

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            disputeType: "DAMAGED",
            unitsAffected: 2,
            storeNotes: "Two boxes crushed during unloading",
            evidencePhotoUrls: ["https://example.com/crushed.jpg"],
          }),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(201);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.disputeId).toBe("DSP-1");
        expect(claimSpy).toHaveBeenCalledWith("OUT001", "u1", {
          orderId: "ORD-1",
          itemId: undefined,
          disputeType: "DAMAGED",
          unitsAffected: 2,
          storeNotes: "Two boxes crushed during unloading",
          evidencePhotoUrls: ["https://example.com/crushed.jpg"],
        });
      });

      it("handles optional itemId", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        const claimSpy = vi.spyOn(StoreService, "createStoreClaim").mockResolvedValue({
          disputeId: "DSP-2",
        } as any);

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            itemId: "ITEM-99",
            disputeType: "SHORT_DELIVERY",
            unitsAffected: 1,
            storeNotes: "Short by 1 item",
          }),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(201);
        expect(claimSpy).toHaveBeenCalledWith("OUT001", "u1", {
          orderId: "ORD-1",
          itemId: "ITEM-99",
          disputeType: "SHORT_DELIVERY",
          unitsAffected: 1,
          storeNotes: "Short by 1 item",
          evidencePhotoUrls: undefined,
        });
      });

      it("returns 400 when StoreService throws INVALID_ORDER_STATE", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "createStoreClaim").mockRejectedValue(
          new Error("INVALID_ORDER_STATE")
        );

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            disputeType: "DAMAGED",
            unitsAffected: 2,
            storeNotes: "Notes",
          }),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe("INVALID_ORDER_STATE");
      });

      it("returns 400 when StoreService throws INVALID_UNITS_AFFECTED", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "createStoreClaim").mockRejectedValue(
          new Error("INVALID_UNITS_AFFECTED")
        );

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            disputeType: "DAMAGED",
            unitsAffected: 2,
            storeNotes: "Notes",
          }),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe("VALIDATION_ERROR");
      });

      it("returns 500 when StoreService throws unexpected error", async () => {
        vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
        vi.spyOn(StoreService, "createStoreClaim").mockRejectedValue(
          new Error("Unexpected DB crash")
        );

        const req = new Request("http://localhost:3000/api/store/claims", {
          method: "POST",
          body: JSON.stringify({
            orderId: "ORD-1",
            disputeType: "DAMAGED",
            unitsAffected: 2,
            storeNotes: "Notes",
          }),
        });
        const res = await postClaim(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
      });
    });
  });
});
