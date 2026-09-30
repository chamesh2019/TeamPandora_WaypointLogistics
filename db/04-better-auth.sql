-- Better Auth PostgreSQL Schema & Waypoint Logistics Integration
-- Table names quoted to prevent conflicts with PostgreSQL reserved words

CREATE TABLE IF NOT EXISTS "user" (
  "id" VARCHAR(36) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  "image" TEXT,
  "username" VARCHAR(50) UNIQUE,
  "displayUsername" TEXT,
  "role" user_role NOT NULL DEFAULT 'dispatcher',
  "depotId" VARCHAR(20) REFERENCES depots(depot_id) ON DELETE SET NULL,
  "outletId" VARCHAR(20) REFERENCES outlets(outlet_id) ON DELETE SET NULL,
  "phoneNumber" VARCHAR(20),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" VARCHAR(36) PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "token" VARCHAR(255) NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" VARCHAR(36) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" VARCHAR(36) PRIMARY KEY,
  "accountId" VARCHAR(255) NOT NULL,
  "providerId" VARCHAR(50) NOT NULL,
  "userId" VARCHAR(36) NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope" TEXT,
  "password" VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" VARCHAR(36) PRIMARY KEY,
  "identifier" VARCHAR(255) NOT NULL,
  "value" VARCHAR(255) NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_role ON "user"("role");
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"("username");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"("token");
CREATE INDEX IF NOT EXISTS idx_session_userId ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON "account"("userId");
