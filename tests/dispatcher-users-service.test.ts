import { describe, it, expect, afterAll } from "vitest";
import { DispatcherService } from "../lib/services/dispatcher-service";
import { pool } from "../lib/db";

describe("DispatcherService User Management", () => {
  const testUsername = "test_staff_user_" + Date.now();
  const testEmail = `${testUsername}@waypoint.lk`;
  let createdUserId = "";

  afterAll(async () => {
    // Cleanup any created test accounts
    if (createdUserId) {
      await pool.query('DELETE FROM "session" WHERE "userId" = $1', [createdUserId]);
      await pool.query('DELETE FROM "account" WHERE "userId" = $1', [createdUserId]);
      await pool.query('DELETE FROM "user" WHERE "id" = $1', [createdUserId]);
      await pool.query('DELETE FROM users WHERE user_id = $1 OR username = $2', [createdUserId, testUsername]);
    }
  });

  describe("getUsers", () => {
    it("retrieves the staff roster, role KPI counts, depots, and outlets", async () => {
      const data = await DispatcherService.getUsers();

      expect(data).toBeDefined();
      expect(data.kpis).toBeDefined();
      expect(typeof data.kpis.total).toBe("number");
      expect(typeof data.kpis.dispatchers).toBe("number");
      expect(typeof data.kpis.drivers).toBe("number");
      expect(typeof data.kpis.loaders).toBe("number");
      expect(typeof data.kpis.storeManagers).toBe("number");
      expect(data.kpis.total).toBeGreaterThanOrEqual(4);

      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users.length).toBeGreaterThanOrEqual(4);

      const first = data.users[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("username");
      expect(first).toHaveProperty("role");
      expect(first).toHaveProperty("status");
      expect(["Active", "Locked"]).toContain(first.status);

      expect(Array.isArray(data.depots)).toBe(true);
      expect(data.depots).toContain("PELIYAGODA");
      expect(data.depots).toContain("KANDY");

      expect(Array.isArray(data.outlets)).toBe(true);
      expect(data.outlets.length).toBeGreaterThan(0);
      expect(data.outlets[0]).toHaveProperty("outletId");
      expect(data.outlets[0]).toHaveProperty("name");
    });

    it("filters users by role correctly", async () => {
      const data = await DispatcherService.getUsers({ role: "driver" });
      expect(data.users.length).toBeGreaterThan(0);
      expect(data.users.every((u) => u.role === "driver")).toBe(true);
    });

    it("filters users by search query", async () => {
      const data = await DispatcherService.getUsers({ search: "Sarath" });
      expect(data.users.length).toBeGreaterThan(0);
      expect(data.users.some((u) => u.name.includes("Sarath"))).toBe(true);
    });
  });

  describe("createUser", () => {
    it("creates a staff user and synchronizes domain users table", async () => {
      const result = await DispatcherService.createUser({
        name: "Test Staff Member",
        username: testUsername,
        email: testEmail,
        password: "SecurePassword123!",
        role: "driver",
        depotId: "PELIYAGODA",
        phoneNumber: "0771234567",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe("Test Staff Member");
      expect(result.username).toBe(testUsername);
      expect(result.role).toBe("driver");

      createdUserId = result.id;

      // Verify domain users table synchronization
      const domainRes = await pool.query(
        "SELECT user_id, username, full_name, role, depot_id, phone_number, status FROM users WHERE username = $1",
        [testUsername]
      );
      expect(domainRes.rows.length).toBe(1);
      const domainUser = domainRes.rows[0];
      expect(domainUser.full_name).toBe("Test Staff Member");
      expect(domainUser.role).toBe("driver");
      expect(domainUser.depot_id).toBe("PELIYAGODA");
      expect(domainUser.phone_number).toBe("0771234567");
      expect(domainUser.status).toBe("Active");
    });

    it("rejects duplicate username with descriptive error", async () => {
      await expect(
        DispatcherService.createUser({
          name: "Duplicate User",
          username: testUsername,
          email: "another_email@waypoint.lk",
          password: "SecurePassword123!",
          role: "driver",
        })
      ).rejects.toThrow(/already (taken|exists)/i);
    });

    it("rejects passwords shorter than 8 characters", async () => {
      await expect(
        DispatcherService.createUser({
          name: "Short Pw User",
          username: "shortpw_" + Date.now(),
          email: "shortpw@waypoint.lk",
          password: "short",
          role: "driver",
        })
      ).rejects.toThrow(/8 characters/i);
    });
  });

  describe("updateUser", () => {
    it("updates staff user role, phone, and locks the account", async () => {
      expect(createdUserId).toBeTruthy();

      const updateRes = await DispatcherService.updateUser(createdUserId, {
        userId: createdUserId,
        name: "Test Staff Member Updated",
        role: "driver",
        depotId: "KANDY",
        phoneNumber: "0779998888",
        status: "Locked",
      });

      expect(updateRes.userId).toBe(createdUserId);
      expect(updateRes.status).toBe("Locked");

      // Verify "user" table
      const authUserRes = await pool.query(
        'SELECT "name", "role", "depotId", "phoneNumber", "status" FROM "user" WHERE "id" = $1',
        [createdUserId]
      );
      expect(authUserRes.rows.length).toBe(1);
      expect(authUserRes.rows[0].name).toBe("Test Staff Member Updated");
      expect(authUserRes.rows[0].depotId).toBe("KANDY");
      expect(authUserRes.rows[0].phoneNumber).toBe("0779998888");
      expect(authUserRes.rows[0].status).toBe("Locked");

      // Verify domain "users" table
      const domainRes = await pool.query(
        "SELECT full_name, role, depot_id, phone_number, status FROM users WHERE user_id = $1 OR username = $2",
        [createdUserId, testUsername]
      );
      expect(domainRes.rows.length).toBe(1);
      expect(domainRes.rows[0].full_name).toBe("Test Staff Member Updated");
      expect(domainRes.rows[0].depot_id).toBe("KANDY");
      expect(domainRes.rows[0].phone_number).toBe("0779998888");
      expect(domainRes.rows[0].status).toBe("Locked");
    });
  });
});
