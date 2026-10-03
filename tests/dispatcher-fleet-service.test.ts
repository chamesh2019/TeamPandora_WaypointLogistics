import { describe, it, expect } from "vitest";
import { DispatcherService } from "../lib/services/dispatcher-service";

describe("DispatcherService Fleet & KPIs", () => {
  describe("getFleet", () => {
    it("retrieves the fleet roster with calculated operational statuses, fuel quota metrics, and driver list", async () => {
      const result = await DispatcherService.getFleet();
      expect(result).toBeDefined();
      expect(result.kpis).toBeDefined();
      expect(typeof result.kpis.totalFleet).toBe("number");
      expect(typeof result.kpis.available).toBe("number");
      expect(typeof result.kpis.inWorkshop).toBe("number");
      expect(Array.isArray(result.vehicles)).toBe(true);
      expect(result.vehicles.length).toBeGreaterThan(0);

      const first = result.vehicles[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("type");
      expect(first).toHaveProperty("temp");
      expect(first).toHaveProperty("operationalStatus");
      expect(["Active", "Idle", "Workshop"]).toContain(first.operationalStatus);
      expect(typeof first.fuelPct).toBe("number");
      expect(Array.isArray(result.drivers)).toBe(true);
    });

    it("filters fleet by depot correctly", async () => {
      const kandyFleet = await DispatcherService.getFleet({ depotId: "KANDY" });
      expect(kandyFleet.vehicles.every((v) => v.depotId === "KANDY")).toBe(true);
    });

    it("filters fleet by operational status", async () => {
      const workshopFleet = await DispatcherService.getFleet({ status: "Workshop" });
      expect(workshopFleet.vehicles.every((v) => v.operationalStatus === "Workshop")).toBe(true);
    });
  });

  describe("getFleetKpis", () => {
    it("returns 10-day historical time-series for all 4 KPI metrics", async () => {
      const kpis = await DispatcherService.getFleetKpis();
      expect(kpis).toBeDefined();
      expect(kpis.days).toBe(10);
      expect(kpis.metrics).toBeDefined();
      expect(kpis.metrics.totalFleet.history.length).toBe(10);
      expect(kpis.metrics.available.history.length).toBe(10);
      expect(kpis.metrics.reeferTrucks.history.length).toBe(10);
      expect(kpis.metrics.inWorkshop.history.length).toBe(10);

      // Verify each history item has date and non-negative value
      kpis.metrics.available.history.forEach((h) => {
        expect(h).toHaveProperty("date");
        expect(typeof h.value).toBe("number");
        expect(h.value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("updateFleetVehicle", () => {
    it("updates status to in_workshop on an idle vehicle, and then restores it to available", async () => {
      const res1 = await DispatcherService.updateFleetVehicle("VEH014", {
        status: "in_workshop",
      });
      expect(res1.vehicleId).toBe("VEH014");
      expect(res1.status).toBe("in_workshop");

      // Verify in getFleet
      const fleet1 = await DispatcherService.getFleet();
      const veh1 = fleet1.vehicles.find((v) => v.id === "VEH014");
      expect(veh1?.operationalStatus).toBe("Workshop");

      // Restore to available
      const res2 = await DispatcherService.updateFleetVehicle("VEH014", {
        status: "available",
      });
      expect(res2.status).toBe("available");

      const fleet2 = await DispatcherService.getFleet();
      const veh2 = fleet2.vehicles.find((v) => v.id === "VEH014");
      expect(veh2?.operationalStatus).toBe("Idle");
    });

    it("rejects sending vehicle to workshop when it is assigned to an active trip", async () => {
      await expect(
        DispatcherService.updateFleetVehicle("VEH001", {
          status: "in_workshop",
        })
      ).rejects.toThrow(/Cannot send vehicle to workshop while assigned to active trip/);
    });

    it("updates assigned driver on a vehicle and allows unassigning", async () => {
      const updated = await DispatcherService.updateFleetVehicle("VEH003", {
        driverId: "usr-driv-001",
      });
      expect(updated.assignedDriverId).toBe("usr-driv-001");

      const cleared = await DispatcherService.updateFleetVehicle("VEH003", {
        driverId: null,
      });
      expect(cleared.assignedDriverId).toBeNull();
    });
  });
});
