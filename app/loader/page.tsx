"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "../../components/layout/top-nav";
import { LoaderOverview } from "../../components/loader/overview";
import { ActiveTrips } from "../../components/loader/active-trips";
import { Manifests } from "../../components/loader/manifests";
import { Shortfalls } from "../../components/loader/shortfalls";
import { Reports } from "../../components/loader/reports";
import { signOut } from "../../lib/auth-client";

type Tab = "Overview" | "Active trips" | "Manifests" | "Shortfalls" | "Reports";

const USER_NAME = "Ravi Fernando";
const USER_INITIALS = "RF";

export default function LoaderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out:", error);
      router.push("/login");
    }
  };

  return (
    <div className="app-shell">
      {/* ── Top Navigation ──────────────────────────────────────── */}
      <TopNav
        currentRole="Loader"
        userName={USER_NAME}
        userInitials={USER_INITIALS}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as Tab)}
        onLogout={handleLogout}
      />

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="main">
        <div className="content">
          {activeTab === "Overview" && (
            <LoaderOverview name={USER_NAME} notify={notify} />
          )}
          {activeTab === "Active trips" && <ActiveTrips notify={notify} />}
          {activeTab === "Manifests" && <Manifests notify={notify} />}
          {activeTab === "Shortfalls" && <Shortfalls notify={notify} />}
          {activeTab === "Reports" && <Reports notify={notify} />}
        </div>
      </main>

      {/* ── Toast notification ──────────────────────────────────── */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
