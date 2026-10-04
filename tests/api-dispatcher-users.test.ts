/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { GET, POST, PATCH } from "../app/api/dispatcher/users/route";
import * as guard from "../lib/api/guard";
import { apiError } from "../lib/api/response";
import { pool } from "../lib/db";
import type { DispatcherAuthContext } from "../lib/types/dispatcher-api";

describe("/api/dispatcher/users Route Handlers", () => {
  const mockAuthContext: DispatcherAuthContext = {
    userId: "usr-disp-001",
    username: "dispatcher1",
    role: "dispatcher",
    depotId: "PELIYAGODA",
  };

  const testUsername = "api_test_user_" + Date.now();
  const testEmail = `${testUsername}@waypoint.lk`;
  let createdUserId = "";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    if (createdUserId) {
      await pool.query('DELETE FROM "session" WHERE "userId" = $1', [createdUserId]);
      await pool.query('DELETE FROM "account" WHERE "userId" = $1', [createdUserId]);
      await pool.query('DELETE FROM "user" WHERE "id" = $1', [createdUserId]);
      await pool.query('DELETE FROM users WHERE user_id = $1 OR username = $2', [createdUserId, testUsername]);
    }
  });

  describe("GET /api/dispatcher/users", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/users");
      const res = await GET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 when forbidden role", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("FORBIDDEN_ROLE", "Access requires dispatcher role", 403)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/users");
      const res = await GET(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN_ROLE");
    });

    it("returns 200 with users, kpis, depots, and outlets for authenticated dispatcher", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/users?role=driver");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.kpis).toBeDefined();
      expect(json.data.users).toBeDefined();
      expect(Array.isArray(json.data.users)).toBe(true);
      expect(json.data.depots).toBeDefined();
      expect(json.data.outlets).toBeDefined();
    });
  });

  describe("POST /api/dispatcher/users", () => {
    it("returns 400 when required fields are missing", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Incomplete User",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 201 on successful user creation", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "API Test Driver",
          username: testUsername,
          email: testEmail,
          password: "SecurePassword123!",
          role: "driver",
          depotId: "PELIYAGODA",
          phoneNumber: "0771234567",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
      expect(json.data.username).toBe(testUsername);
      expect(json.data.role).toBe("driver");

      createdUserId = json.data.id;
    });

    it("returns 400 when attempting to create a user with duplicate username", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate Driver",
          username: testUsername,
          email: "another_dup@waypoint.lk",
          password: "SecurePassword123!",
          role: "driver",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toMatch(/already (taken|exists)/i);
    });
  });

  describe("PATCH /api/dispatcher/users", () => {
    it("returns 400 when userId is missing", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Locked",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toMatch(/userId is required/i);
    });

    it("returns 200 on successful status lock", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: createdUserId,
          status: "Locked",
        }),
      });

      const res = await PATCH(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.userId).toBe(createdUserId);
      expect(json.data.status).toBe("Locked");
    });
  });
});
