import { describe, it, expect, vi } from "vitest";
import { requireDriver } from "@/lib/api/guard";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("Driver Auth Guard (requireDriver)", () => {
  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);
    const req = new Request("http://localhost:3000/api/driver/active-trip");
    const res = await requireDriver(req);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it("rejects non-driver and non-dispatcher roles with 403", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "usr-load-001", role: "loader" },
      session: { id: "sess-1" },
    } as any);
    const req = new Request("http://localhost:3000/api/driver/active-trip");
    const res = await requireDriver(req);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it("authorizes driver and scopes driverId to session userId", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "usr-driv-001", role: "driver", name: "Nimal Fernando", depotId: "PELIYAGODA" },
      session: { id: "sess-1" },
    } as any);
    const req = new Request("http://localhost:3000/api/driver/active-trip");
    const authCtx = await requireDriver(req);
    expect(authCtx).not.toBeInstanceOf(Response);
    if (!(authCtx instanceof Response)) {
      expect(authCtx.userId).toBe("usr-driv-001");
      expect(authCtx.driverId).toBe("usr-driv-001");
      expect(authCtx.role).toBe("driver");
      expect(authCtx.depotId).toBe("PELIYAGODA");
    }
  });

  it("allows dispatcher to specify driverId via query param or header", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "usr-disp-001", role: "dispatcher", name: "Dispatcher One" },
      session: { id: "sess-1" },
    } as any);
    const req = new Request("http://localhost:3000/api/driver/active-trip?driverId=usr-driv-002");
    const authCtx = await requireDriver(req);
    expect(authCtx).not.toBeInstanceOf(Response);
    if (!(authCtx instanceof Response)) {
      expect(authCtx.role).toBe("dispatcher");
      expect(authCtx.driverId).toBe("usr-driv-002");
    }
  });
});
