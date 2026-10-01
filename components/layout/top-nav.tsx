"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Grid,
  Truck,
  ClipboardList,
  AlertTriangle,
  BarChart2,
  Search,
  Clock,
  Bell,
  Settings,
  LogOut,
  Shield,
  History,
} from "lucide-react";
import type { Role } from "../../lib/types";

export interface TopTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TopNavProps {
  currentRole?: Role;
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
  tabs?: TopTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const DEFAULT_LOADER_TABS: TopTab[] = [
  { id: "Overview", label: "Overview", icon: <Grid style={{ width: 14, height: 14 }} /> },
  { id: "Active trips", label: "Active trips", icon: <Truck style={{ width: 14, height: 14 }} />, count: 3 },
  { id: "Manifests", label: "Manifests", icon: <ClipboardList style={{ width: 14, height: 14 }} /> },
  { id: "Shortfalls", label: "Shortfalls", icon: <AlertTriangle style={{ width: 14, height: 14 }} />, count: 2 },
  { id: "Reports", label: "Reports", icon: <BarChart2 style={{ width: 14, height: 14 }} /> },
];

export function TopNav({
  currentRole = "Loader",
  userName = "Ravi Fernando",
  userInitials = "RF",
  onLogout,
  tabs = DEFAULT_LOADER_TABS,
  activeTab = "Overview",
  onTabChange,
}: TopNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="topnav">
      {/* Brand block: yellow "W" mark, "Waypoint CONTROL" text, "12" badge */}
      <Link href="/" className="topnav-brand">
        <div className="topnav-mark">W</div>
        <div className="topnav-brand-text">
          <span className="topnav-brand-name">Waypoint</span>
          <span className="topnav-brand-sub">CONTROL</span>
        </div>
      </Link>
      <div className="topnav-badge">12</div>

      {/* Role Navigation Pills */}
      <nav className="topnav-pills">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || activeTab === tab.label;
          return (
            <button
              key={tab.id}
              id={`topnav-tab-${tab.id.toLowerCase().replace(/ /g, "-")}`}
              className={`topnav-tab${isActive ? " active" : ""}`}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="topnav-tab-count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="topnav-spacer" />

      {/* Right side controls: Search box, Demo button, Bell with red dot, Settings gear, Yellow avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Search */}
        <div className="topnav-search">
          <Search style={{ width: 13, height: 13 }} />
          <input
            type="text"
            placeholder="Search orders, trips…"
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Demo Button */}
        <button
          type="button"
          className="topnav-tab"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "5px 12px",
          }}
        >
          <Clock style={{ width: 14, height: 14 }} />
          <span>Demo</span>
        </button>

        {/* Bell with red dot */}
        <button
          type="button"
          aria-label="Notifications"
          className="topnav-icon"
        >
          <Bell style={{ width: 16, height: 16 }} />
          <span className="notif-dot" />
        </button>

        {/* Settings gear */}
        <button
          type="button"
          aria-label="Settings"
          className="topnav-icon"
        >
          <Settings style={{ width: 16, height: 16 }} />
        </button>

        {/* Yellow avatar */}
        <div className="topnav-avatar-wrap">
          <button
            type="button"
            className="topnav-avatar"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="User profile"
          >
            {userInitials}
          </button>

          {profileOpen && (
            <div className="topnav-dropdown">
              <div className="topnav-dropdown-header">
                <div className="topnav-dropdown-avatar">{userInitials}</div>
                <div>
                  <div className="topnav-dropdown-name">{userName}</div>
                  <span className="role-badge">{currentRole} · Peliyagoda</span>
                </div>
              </div>

              <Link
                href="/dispatcher/users"
                className="topnav-dropdown-item"
                onClick={() => setProfileOpen(false)}
              >
                <Shield style={{ width: 14, height: 14 }} />
                <span>Security & Roles</span>
              </Link>

              <button
                type="button"
                className="topnav-dropdown-item"
                onClick={() => setProfileOpen(false)}
              >
                <History style={{ width: 14, height: 14 }} />
                <span>Login History</span>
              </button>

              <div className="topnav-dropdown-sep" />

              <button
                type="button"
                className="topnav-dropdown-item danger"
                onClick={() => {
                  setProfileOpen(false);
                  if (onLogout) onLogout();
                }}
              >
                <LogOut style={{ width: 14, height: 14 }} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

