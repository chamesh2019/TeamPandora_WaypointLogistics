"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { LogisticsIllustration } from "@/components/auth/logistics-illustration";
import {
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  Truck,
  Layers,
} from "lucide-react";

interface DemoAccount {
  username: string;
  password: string;
  role: string;
  label: string;
  name: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "dispatcher",
    password: "dispatch123",
    role: "dispatcher",
    label: "Dispatcher",
    name: "Sarath Gunawardena",
  },
  {
    username: "loader",
    password: "loader123",
    role: "loader",
    label: "Dock Loader",
    name: "Sunil Jayasinghe",
  },
  {
    username: "driver",
    password: "driver123",
    role: "driver",
    label: "Driver",
    name: "Nimal Fernando",
  },
  {
    username: "store_manager",
    password: "store123",
    role: "store_manager",
    label: "Store",
    name: "Anura Silva",
  },
];

const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  dispatcher: "/dispatcher",
  loader: "/loader",
  driver: "/driver",
  store_manager: "/store",
};

const FEATURE_POINTS = [
  "Fleet management & GPS tracking",
  "Real-time delivery visibility",
  "Smart load allocation engine",
  "Offline delivery support",
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [username, setUsername] = useState("dispatcher");
  const [password, setPassword] = useState("dispatch123");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [failCount, setFailCount] = useState(0);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleQuickFill = (acc: DemoAccount) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError("");
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password;

    if (failCount >= 5) {
      setError(
        "Account temporarily locked due to 5 consecutive failed attempts. Contact IT support."
      );
      return;
    }

    if (!trimmedUser || !trimmedPass) {
      setError("Please enter your username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signIn.username({
        username: trimmedUser,
        password: trimmedPass,
      });

      if (res?.error) {
        const nextFails = failCount + 1;
        setFailCount(nextFails);
        if (nextFails >= 5) {
          setError(
            "Account temporarily locked due to 5 consecutive failed attempts. Contact IT support."
          );
        } else {
          setError(
            `Invalid credentials. ${5 - nextFails} attempt${
              5 - nextFails === 1 ? "" : "s"
            } remaining before account lock.`
          );
        }
        setLoading(false);
        return;
      }

      // Successful authentication: determine destination route with open-redirect safeguard
      const isSafeRedirect =
        redirectParam &&
        redirectParam.startsWith("/") &&
        !redirectParam.startsWith("//") &&
        !redirectParam.startsWith("/.well-known") &&
        !redirectParam.startsWith("/api") &&
        !redirectParam.startsWith("/login");

      if (isSafeRedirect) {
        router.push(redirectParam);
      } else {
        const userRole = (res?.data?.user as any)?.role || "dispatcher";
        const targetRoute = ROLE_DEFAULT_ROUTES[userRole] || "/dispatcher";
        router.push(targetRoute);
      }
    } catch (err: any) {
      const nextFails = failCount + 1;
      setFailCount(nextFails);
      setError(
        err?.message ||
          "Authentication failed. Please verify your credentials and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-page font-sans">
      {/* Left panel: Figma 1:1 Branding, Tagline & Logistics Illustration */}
      <div className="login-left">
        <div>
          <div className="login-left-logo">
            <div className="login-left-mark">W</div>
            <div>
              <div className="login-left-brand">
                Waypoint Group
                <small>Logistics Operations</small>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 52 }}>
            <div className="login-product-name">Waypoint Control</div>
            <div className="login-tagline">
              Intelligent
              <br />
              <em>logistics</em>
              <br />
              operations.
            </div>
            <div className="login-tagline-sub">
              Enterprise fleet distribution management across Peliyagoda and Kandy hubs.
            </div>

            <div className="login-features">
              {FEATURE_POINTS.map((feature) => (
                <div key={feature} className="login-feature">
                  <div className="login-feature-check">
                    <Check className="w-3 h-3 text-[#F5C542]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <LogisticsIllustration />
        </div>
      </div>

      {/* Right panel: Figma 1:1 Login Form Card & Quick Fill Chips */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-welcome">Welcome back</div>
          <div className="login-sub">Sign in to continue your operations</div>

          {error && (
            <div className="login-alert" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Username input */}
            <div className="login-field">
              <label htmlFor="username-input" className="login-label">
                Username / Email
              </label>
              <div className="login-input-wrap">
                <input
                  id="username-input"
                  type="text"
                  className={`login-input${error ? " error" : ""}`}
                  placeholder="dispatcher or dispatcher@waypoint.lk"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      passwordInputRef.current?.focus();
                    }
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="login-field">
              <label htmlFor="password-input" className="login-label">
                Password
              </label>
              <div className="login-input-wrap">
                <input
                  ref={passwordInputRef}
                  id="password-input"
                  type={showPass ? "text" : "password"}
                  className={`login-input${error ? " error" : ""}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password row */}
            <div className="login-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() =>
                  alert(
                    "Password reset requests are forwarded to IT support at it-support@waypoint.lk"
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading || failCount >= 5}
            >
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credential Quick-Fill Section */}
          <div className="demo-hint mt-6">
            <strong>Operational Demo Accounts</strong>
            <p className="text-[10px] text-indigo-700/80 mb-2">
              Select an operational role to instantly test permissions:
            </p>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`text-left px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors border flex items-center justify-between ${
                    username === acc.username
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                      : "bg-white/80 hover:bg-white text-indigo-900 border-indigo-200/80"
                  }`}
                >
                  <span className="truncate">{acc.label}</span>
                  <span className="font-mono text-[9px] opacity-70">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer">
            <div className="login-footer-sep">or</div>
            <div className="login-footer-text">
              Need access?{" "}
              <a
                href="mailto:it-support@waypoint.lk"
                className="text-[#6366F1] font-semibold"
              >
                Contact your administrator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#ECEEF5]">
          <span className="btn-spinner" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
