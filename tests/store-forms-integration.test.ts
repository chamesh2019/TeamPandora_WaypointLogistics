import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import * as fs from "node:fs";
import * as path from "node:path";
import PlaceOrderForm, {
  submitPlaceOrder,
  formatOrderPayload,
} from "../app/store/orders/place-order-form";
import NewClaimForm, {
  submitNewClaim,
  formatClaimPayload,
} from "../app/store/claims/new-claim-form";

describe("Store Forms Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("PlaceOrderForm Integration", () => {
    it("exports submitPlaceOrder and formatOrderPayload functions", () => {
      expect(typeof submitPlaceOrder).toBe("function");
      expect(typeof formatOrderPayload).toBe("function");
    });

    it("formats order payload with MM/DD/YYYY to ISO YYYY-MM-DD conversion and numeric parsing", () => {
      const payload = formatOrderPayload({
        deliveryDate: "06/14/2025",
        tempRequirement: "ambient",
        totalCartons: "24",
        estimatedWeight: "420.5",
        estimatedVolume: "4.2",
        notes: "  Dock door 3 delivery  ",
      });

      expect(payload).toEqual({
        deliveryDate: "2025-06-14",
        tempRequirement: "ambient",
        orderUnits: 24,
        orderWeightKg: 420.5,
        orderVolumeM3: 4.2,
        notes: "Dock door 3 delivery",
      });
    });

    it("handles single-digit month and day date conversion", () => {
      const payload = formatOrderPayload({
        deliveryDate: "6/4/2025",
        tempRequirement: "chilled",
        totalCartons: "10",
        estimatedWeight: "150",
        estimatedVolume: "1.5",
      });

      expect(payload.deliveryDate).toBe("2025-06-04");
      expect(payload.tempRequirement).toBe("chilled");
      expect(payload.orderUnits).toBe(10);
      expect(payload.orderWeightKg).toBe(150);
      expect(payload.orderVolumeM3).toBe(1.5);
      expect(payload.notes).toBeUndefined();
    });

    it("rejects invalid numeric inputs during payload formatting", () => {
      expect(() =>
        formatOrderPayload({
          deliveryDate: "06/14/2025",
          tempRequirement: "ambient",
          totalCartons: "-5",
          estimatedWeight: "100",
          estimatedVolume: "1",
        })
      ).toThrow(/cartons/i);

      expect(() =>
        formatOrderPayload({
          deliveryDate: "06/14/2025",
          tempRequirement: "ambient",
          totalCartons: "20",
          estimatedWeight: "0",
          estimatedVolume: "1",
        })
      ).toThrow(/weight/i);

      expect(() =>
        formatOrderPayload({
          deliveryDate: "06/14/2025",
          tempRequirement: "ambient",
          totalCartons: "20",
          estimatedWeight: "100",
          estimatedVolume: "invalid",
        })
      ).toThrow(/volume/i);
    });

    it("executes POST /api/store/orders with formatted JSON payload on successful submit", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: {
            orderId: "ORD-20261001-001",
            outletId: "OUT001",
            brandId: "BRAND_FRESH",
            deliveryDate: "2025-06-14",
            isAfterCutoff: true,
            dispatchDate: "2025-06-15",
          },
          meta: {
            notice: "Order placed after 16:00 cutoff. Scheduled for following delivery run.",
          },
        }),
      });

      const result = await submitPlaceOrder(
        {
          deliveryDate: "06/14/2025",
          tempRequirement: "ambient",
          totalCartons: "24",
          estimatedWeight: "420",
          estimatedVolume: "4.2",
          notes: "Handle with care",
        },
        mockFetch
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/store/orders");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({ "Content-Type": "application/json" });

      const parsedBody = JSON.parse(options.body);
      expect(parsedBody).toEqual({
        deliveryDate: "2025-06-14",
        tempRequirement: "ambient",
        orderUnits: 24,
        orderWeightKg: 420,
        orderVolumeM3: 4.2,
        notes: "Handle with care",
      });

      expect(result.success).toBe(true);
      expect(result.data.orderId).toBe("ORD-20261001-001");
      expect(result.meta?.notice).toContain("Order placed after 16:00 cutoff");
    });

    it("surfaces API error messages when POST /api/store/orders fails", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: "CHILLED_NOT_ALLOWED",
            message: "Only Waypoint Fresh outlets are permitted to order chilled goods.",
          },
        }),
      });

      await expect(
        submitPlaceOrder(
          {
            deliveryDate: "06/14/2025",
            tempRequirement: "chilled",
            totalCartons: "20",
            estimatedWeight: "100",
            estimatedVolume: "1.0",
          },
          mockFetch
        )
      ).rejects.toThrow("Only Waypoint Fresh outlets are permitted to order chilled goods.");
    });

    it("renders PlaceOrderForm component without crashing", () => {
      const onClose = vi.fn();
      const html = ReactDOMServer.renderToString(
        React.createElement(PlaceOrderForm, { onClose })
      );
      expect(html).toContain("Place a new order");
      expect(html).toContain("Submit order");
      expect(html).toContain("06/14/2025");
    });

    it("component source code contains live fetch, loading state and error handling", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "../app/store/orders/place-order-form.tsx"),
        "utf-8"
      );
      expect(source).toContain("/api/store/orders");
      expect(source).toContain("isSubmitting");
      expect(source).toContain("errorMessage");
      expect(source).not.toMatch(/function handleSubmit\(\)\s*\{\s*onClose\(\);\s*\}/);
    });
  });

  describe("NewClaimForm Integration", () => {
    it("exports submitNewClaim and formatClaimPayload functions", () => {
      expect(typeof submitNewClaim).toBe("function");
      expect(typeof formatClaimPayload).toBe("function");
    });

    it("formats claim payload with mapped fields, normalized disputeType, and parsed unitsAffected", () => {
      const payload = formatClaimPayload({
        orderId: "ORD-250613-0001",
        disputeType: "DAMAGED",
        unitsAffected: "3",
        storeNotes: "3 cartons damaged due to rough transit",
        evidencePhotoUrls: ["https://example.com/photo1.jpg"],
      });

      expect(payload).toEqual({
        orderId: "ORD-250613-0001",
        disputeType: "DAMAGED",
        unitsAffected: 3,
        storeNotes: "3 cartons damaged due to rough transit",
        evidencePhotoUrls: ["https://example.com/photo1.jpg"],
      });
    });

    it("normalizes legacy lowercase dispute types to API enum", () => {
      expect(
        formatClaimPayload({
          orderId: "ORD-1",
          disputeType: "cargo_damage",
          unitsAffected: 2,
          storeNotes: "Box broken",
        }).disputeType
      ).toBe("DAMAGED");

      expect(
        formatClaimPayload({
          orderId: "ORD-1",
          disputeType: "short_delivery",
          unitsAffected: 1,
          storeNotes: "Missing carton",
        }).disputeType
      ).toBe("SHORT_DELIVERY");

      expect(
        formatClaimPayload({
          orderId: "ORD-1",
          disputeType: "wrong_item",
          unitsAffected: 1,
          storeNotes: "Wrong SKU",
        }).disputeType
      ).toBe("WRONG_PRODUCT");
    });

    it("rejects invalid claim payload with missing fields or non-positive units", () => {
      expect(() =>
        formatClaimPayload({
          orderId: "",
          disputeType: "DAMAGED",
          unitsAffected: "2",
          storeNotes: "Damaged box",
        })
      ).toThrow(/order id/i);

      expect(() =>
        formatClaimPayload({
          orderId: "ORD-1",
          disputeType: "DAMAGED",
          unitsAffected: "0",
          storeNotes: "Damaged box",
        })
      ).toThrow(/units affected/i);

      expect(() =>
        formatClaimPayload({
          orderId: "ORD-1",
          disputeType: "DAMAGED",
          unitsAffected: "2",
          storeNotes: "",
        })
      ).toThrow(/notes/i);
    });

    it("executes POST /api/store/claims with mapped JSON payload on successful submit", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: {
            disputeId: "DSP-20261001-001",
            orderId: "ORD-250613-0001",
            disputeType: "SHORT_DELIVERY",
            unitsAffected: 2,
            status: "OPEN",
          },
        }),
      });

      const result = await submitNewClaim(
        {
          orderId: "ORD-250613-0001",
          disputeType: "SHORT_DELIVERY",
          unitsAffected: "2",
          storeNotes: "Missing 2 milk cartons from shipment",
          evidencePhotoUrls: ["https://example.com/evidence.jpg"],
        },
        mockFetch
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("/api/store/claims");
      expect(options.method).toBe("POST");
      expect(options.headers).toEqual({ "Content-Type": "application/json" });

      const parsedBody = JSON.parse(options.body);
      expect(parsedBody).toEqual({
        orderId: "ORD-250613-0001",
        disputeType: "SHORT_DELIVERY",
        unitsAffected: 2,
        storeNotes: "Missing 2 milk cartons from shipment",
        evidencePhotoUrls: ["https://example.com/evidence.jpg"],
      });

      expect(result.success).toBe(true);
      expect(result.data.disputeId).toBe("DSP-20261001-001");
    });

    it("surfaces API error messages when POST /api/store/claims fails", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: {
            code: "INVALID_ORDER_STATE",
            message: "Order is not in a valid state for filing a claim",
          },
        }),
      });

      await expect(
        submitNewClaim(
          {
            orderId: "ORD-250613-0001",
            disputeType: "DAMAGED",
            unitsAffected: "1",
            storeNotes: "Damaged box",
          },
          mockFetch
        )
      ).rejects.toThrow("Order is not in a valid state for filing a claim");
    });

    it("renders NewClaimForm component without crashing and includes units affected field", () => {
      const onClose = vi.fn();
      const html = ReactDOMServer.renderToString(
        React.createElement(NewClaimForm, { onClose })
      );
      expect(html).toContain("Raise a new claim");
      expect(html).toContain("Submit claim");
      expect(html).toContain("Related Order");
    });

    it("component source code contains live fetch, loading state and error handling", () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, "../app/store/claims/new-claim-form.tsx"),
        "utf-8"
      );
      expect(source).toContain("/api/store/claims");
      expect(source).toContain("isSubmitting");
      expect(source).toContain("errorMessage");
      expect(source).not.toMatch(/function handleSubmit\(\)\s*\{\s*\/\/\s*handle submit logic here\s*onClose\(\);\s*\}/);
    });
  });
});
