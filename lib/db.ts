import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://waypoint_user:waypoint_secure_pass@localhost:5432/waypoint_db";

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});
