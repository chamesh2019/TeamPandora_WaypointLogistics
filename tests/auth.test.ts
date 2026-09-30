import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";

describe("Waypoint Better Auth Integration", () => {
  const testUsername = "dispatcher_test_" + Date.now();
  const testPassword = "dispatch_secure_pass_123";
  let createdUserId: string;

  beforeAll(async () => {
    // Ensure clean state in database if needed
  });

  afterAll(async () => {
    // Clean up test data
    if (createdUserId) {
      await pool.query('DELETE FROM "session" WHERE "userId" = $1', [createdUserId]);
      await pool.query('DELETE FROM "account" WHERE "userId" = $1', [createdUserId]);
      await pool.query('DELETE FROM "user" WHERE "id" = $1', [createdUserId]);
    }
  });

  it("should have username and bearer plugins configured", () => {
    expect(auth.options.plugins).toBeDefined();
    const pluginIds = auth.options.plugins?.map((p) => p.id);
    expect(pluginIds).toContain("username");
    expect(pluginIds).toContain("bearer");
  });

  it("should support user provisioning with role and logistics fields", async () => {
    const res = await auth.api.signUpEmail({
      body: {
        email: `${testUsername}@waypoint.com`,
        password: testPassword,
        name: "Test Dispatcher",
        username: testUsername,
        role: "dispatcher",
        depotId: "PELIYAGODA",
        phoneNumber: "0711122334",
      },
    });

    expect(res).toBeDefined();
    expect(res.user).toBeDefined();
    expect(res.user.email).toBe(`${testUsername}@waypoint.com`);
    expect(res.user.role).toBe("dispatcher");
    expect(res.user.depotId).toBe("PELIYAGODA");
    expect(res.user.username).toBe(testUsername);
    createdUserId = res.user.id;
  });

  it("should authenticate staff member via username and password", async () => {
    const res = await auth.api.signInUsername({
      body: {
        username: testUsername,
        password: testPassword,
      },
    });

    expect(res).toBeDefined();
    expect(res.user).toBeDefined();
    expect(res.user.id).toBe(createdUserId);
    expect(res.session).toBeDefined();
    expect(res.session.token).toBeDefined();
  });

  it("should reject sign in with invalid password", async () => {
    await expect(
      auth.api.signInUsername({
        body: {
          username: testUsername,
          password: "wrong_password_xyz",
        },
      })
    ).rejects.toThrow();
  });

  it("should introspect active session via getSession", async () => {
    // Sign in to get session
    const signInRes = await auth.api.signInUsername({
      body: {
        username: testUsername,
        password: testPassword,
      },
    });

    const token = signInRes.session.token;
    const sessionRes = await auth.api.getSession({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    });

    expect(sessionRes).toBeDefined();
    expect(sessionRes?.user?.username).toBe(testUsername);
    expect(sessionRes?.user?.role).toBe("dispatcher");
  });

  it("should sign out and revoke session", async () => {
    const signInRes = await auth.api.signInUsername({
      body: {
        username: testUsername,
        password: testPassword,
      },
    });

    const token = signInRes.session.token;
    const signOutRes = await auth.api.signOut({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    });

    expect(signOutRes).toBeDefined();

    // Session should now be invalid
    const checkSession = await auth.api.getSession({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    });
    expect(checkSession).toBeNull();
  });
});
