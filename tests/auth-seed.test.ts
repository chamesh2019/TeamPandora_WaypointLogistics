import { describe, it, expect } from "vitest";
import { verifyPassword } from "better-auth/crypto";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Better Auth Seed Migration & Docker Synchronization", () => {
  const seedSqlPath = path.resolve(__dirname, "../db/05-auth-seed.sql");
  const dockerComposePath = path.resolve(__dirname, "../docker-compose.yml");

  it("verifies seed sql file exists and contains all 4 standard accounts", () => {
    expect(fs.existsSync(seedSqlPath)).toBe(true);
    const content = fs.readFileSync(seedSqlPath, "utf-8");

    expect(content).toContain("usr-disp-001");
    expect(content).toContain("usr-load-001");
    expect(content).toContain("usr-driv-001");
    expect(content).toContain("usr-stor-001");
    expect(content).toContain("'dispatcher'");
    expect(content).toContain("'loader'");
    expect(content).toContain("'driver'");
    expect(content).toContain("'store_manager'");
  });

  it("verifies scrypt password hashes match canonical credentials", async () => {
    const content = fs.readFileSync(seedSqlPath, "utf-8");
    
    // Extract hashed passwords from account inserts
    const hashRegex = /\('acc-[^']+',\s*'[^']+',\s*'credential',\s*'[^']+',\s*'([^']+)'/g;
    const matches: string[] = [];
    let match;
    while ((match = hashRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    expect(matches.length).toBeGreaterThanOrEqual(4);
    
    // Validate each credential pair using Better Auth's crypto engine
    expect(await verifyPassword({ password: "dispatch123", hash: matches[0] })).toBe(true);
    expect(await verifyPassword({ password: "loader123", hash: matches[1] })).toBe(true);
    expect(await verifyPassword({ password: "driver123", hash: matches[2] })).toBe(true);
    expect(await verifyPassword({ password: "store123", hash: matches[3] })).toBe(true);
  });

  it("verifies docker-compose mounts 04-better-auth.sql and 05-auth-seed.sql and configures auth env", () => {
    const dc = fs.readFileSync(dockerComposePath, "utf-8");
    expect(dc).toContain("04-better-auth.sql");
    expect(dc).toContain("05-auth-seed.sql");
    expect(dc).toContain("BETTER_AUTH_SECRET");
    expect(dc).toContain("BETTER_AUTH_URL");
    expect(dc).toContain("NEXT_PUBLIC_APP_URL");
  });
});
