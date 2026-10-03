import { describe, it, expect, vi } from "vitest";
import { requireLoader } from "@/lib/api/guard";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe("Loader Auth Guard (requireLoader)", () => {
  it("rejects unauthenticated requests with 401", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);
    const req = new Request("http://localhost:3000/api/loader/overview");
    const res = await requireLoader(req);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it("rejects non-loader and non-dispatcher roles with 403", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "usr-store-001", role: "store_manager" },
      session: { id: "sess-1" },
    } as any);
    const req = new Request("http://localhost:3000/api/loader/overview");
    const res = await requireLoader(req);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it("authorizes loader and defaults depot to PELIYAGODA", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "usr-load-001", role: "loader", depotId: "PELIYAGODA", name: "Sunil Jayasinghe" },
      session: { id: "sess-1" },
    } as any);
    const req = new Request("http://localhost:3000/api/loader/overview");
    const authCtx = await requireLoader(req);
    expect(authCtx).not.toBeInstanceOf(Response);
    if (!(authCtx instanceof Response)) {
      expect(authCtx.userId).toBe("usr-load-001");
      expect(authCtx.role).toBe("loader");
      expect(authCtx.depotId).toBe("PELIYAGODA");
    }
  });

  it("authorizes dispatcher with custom depot override header", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: "usr-disp-001", role: "dispatcher" },
      session: { id: "sess-1" },
    } as any);
    const req = new Request("http://localhost:3000/api/loader/overview", {
      headers: { "x-depot-id": "KANDY" },
    });
    const authCtx = await requireLoader(req);
    expect(authCtx).not.toBeInstanceOf(Response);
    if (!(authCtx instanceof Response)) {
      expect(authCtx.depotId).toBe("KANDY");
    }
  });
});
