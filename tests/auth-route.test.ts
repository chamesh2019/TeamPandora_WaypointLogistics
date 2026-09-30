import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/auth/[...all]/route";
import { NextRequest } from "next/server";

describe("App Router /api/auth/[...all] Handler", () => {
  it("exports GET and POST handlers", () => {
    expect(typeof GET).toBe("function");
    expect(typeof POST).toBe("function");
  });

  it("handles GET /api/auth/get-session without throwing", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/get-session");
    const res = await GET(req);
    expect(res).toBeDefined();
    expect(res.status).toBe(200);
  });

  it("handles POST /api/auth/sign-in/username with validation rejection", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/sign-in/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "non_existent_staff_member",
        password: "wrong_password",
      }),
    });
    const res = await POST(req);
    expect(res).toBeDefined();
    // Better Auth returns 400 or 401 for invalid credentials
    expect([400, 401]).toContain(res.status);
  });
});
