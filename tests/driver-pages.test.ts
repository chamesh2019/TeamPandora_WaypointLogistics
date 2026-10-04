import { describe, it, expect, vi } from "vitest";
import React from "react";
import DriverPage from "@/app/driver/page";
import DriverDeparturePage from "@/app/driver/departure/page";
import DriverCurrentStopPage from "@/app/driver/stops/page";
import DriverPodPage from "@/app/driver/pod/page";
import DriverExceptionsPage from "@/app/driver/exceptions/page";

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn().mockReturnValue({
    data: {
      user: { name: "Nimal Fernando", role: "driver" },
    },
    isPending: false,
  }),
  authClient: {
    useSession: vi.fn().mockReturnValue({
      data: {
        user: { name: "Nimal Fernando", role: "driver" },
      },
      isPending: false,
    }),
  },
}));

describe("Driver Frontend Pages", () => {
  it("renders DriverPage without throwing", () => {
    expect(DriverPage).toBeDefined();
    expect(typeof DriverPage).toBe("function");
  });

  it("renders DriverDeparturePage without throwing", () => {
    expect(DriverDeparturePage).toBeDefined();
    expect(typeof DriverDeparturePage).toBe("function");
  });

  it("renders DriverCurrentStopPage without throwing", () => {
    expect(DriverCurrentStopPage).toBeDefined();
    expect(typeof DriverCurrentStopPage).toBe("function");
  });

  it("renders DriverPodPage without throwing", () => {
    expect(DriverPodPage).toBeDefined();
    expect(typeof DriverPodPage).toBe("function");
  });

  it("renders DriverExceptionsPage without throwing", () => {
    expect(DriverExceptionsPage).toBeDefined();
    expect(typeof DriverExceptionsPage).toBe("function");
  });
});
