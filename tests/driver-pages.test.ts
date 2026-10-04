import { describe, it, expect, vi } from "vitest";
import React from "react";
import DriverPage from "@/app/driver/page";
import DriverDeparturePage from "@/app/driver/departure/page";

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
});
