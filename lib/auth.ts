import { betterAuth } from "better-auth";
import { username, bearer } from "better-auth/plugins";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || "waypoint_better_auth_secret_key_super_secure_32chars",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    bearer(),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "dispatcher",
      },
      depotId: {
        type: "string",
        required: false,
      },
      outletId: {
        type: "string",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "Active",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days active session
    updateAge: 60 * 60 * 24, // Refresh every 24 hours
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
