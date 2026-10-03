"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  Shield,
  History,
  ChevronDown,
  User,
  Settings,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import type { Role, NavTabItem } from "../../lib/types";
import { TabItem } from "../design-system";

export interface RoleNavBarProps {
  tabs: NavTabItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  currentRole?: Role;
  userName?: string;
  userInitials?: string;
  roleBadgeCount?: number;
  showCutoffChip?: boolean;
  notificationCount?: number;
  onLogout?: () => void;
  className?: string;
}

export function RoleNavBar({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  currentRole = "Driver",
  userName = "Nimal Perera",
  userInitials = "NP",
  roleBadgeCount,
  showCutoffChip = true,
  notificationCount = 0,
  onLogout,
  className,
}: RoleNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Derive active tab: prefer controlled prop, then match by href, then first tab.
  const activeTabId =
    controlledActiveTab ??
    tabs.find((t) => t.href && pathname === t.href)?.id ??
    tabs.find((t) => t.href && pathname.startsWith(t.href))?.id ??
    tabs[0]?.id;

  // Build TabItem[] compatible with DarkTabs
  const darkTabItems: TabItem[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    count: t.badgeCount,
  }));

  const handleTabSelect = (id: string) => {
    onTabChange?.(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab?.href) router.push(tab.href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 h-16 px-4 sm:px-6",
        "bg-[#0F1928] border-b border-white/5 shadow-[0_2px_16px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {/* ── Brand ── */}
      <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#F5C542] text-[#0F1928] font-extrabold flex items-center justify-center text-sm shadow-[0_0_14px_rgba(245,197,66,0.35)] group-hover:scale-105 transition-transform">
          W
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-bold text-white tracking-tight leading-none">
            Waypoint
          </div>
          <div className="text-[8px] font-semibold text-white/30 tracking-widest uppercase mt-0.5">
            Control
          </div>
        </div>
      </Link>

      {/* Role alert count pill */}
      {roleBadgeCount !== undefined && (
        <span className="flex-shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-[7px] bg-[#F5C542]/20 text-[#F5C542] text-[9px] font-extrabold grid place-items-center">
          {roleBadgeCount}
        </span>
      )}

      {/* ── Nav tabs (DarkTabs pill strip) ── */}
      <nav className="hidden md:flex flex-1 justify-center" aria-label="Role navigation">
        {/* Wrap DarkTabs — icons rendered by injecting them via the wrapping layer */}
        <div className="inline-flex items-center gap-[2px] p-[3px] bg-white/[0.06] rounded-full border border-white/5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={cn(
                  "px-3.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-150",
                  "border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-[#F5C542] text-[#0F1928] font-bold shadow-sm"
                    : "bg-transparent text-[rgba(148,148,190,0.75)] hover:text-white"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.icon && (
                  <span className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "text-[#0F1928]" : "text-current")}>
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span className={cn(
                    "text-[9px] font-extrabold px-1 py-0.5 rounded-full leading-none",
                    isActive ? "bg-[#0F1928]/20 text-[#0F1928]" : "bg-white/10 text-white/70"
                  )}>
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Right side ── */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-full bg-white/[0.07] border border-white/10 text-white/50 focus-within:border-[#F5C542] focus-within:bg-white/10 transition-colors w-44">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, trips…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
            className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-white/30"
          />
        </div>

        {/* Cutoff chip */}
        {showCutoffChip && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cutoff 16:00</span>
          </div>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ""}`}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#0F1928]" />
          )}
          {notificationCount === 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#0F1928]" />
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          aria-label="Settings"
          className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 transition-colors"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-[#F5C542] text-[#0F1928] font-bold text-xs flex items-center justify-center border-2 border-[#F5C542]/40 shadow-sm">
              {userInitials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-60 p-1.5 rounded-xl bg-[#0F1928] border border-white/10 shadow-2xl z-50">
                {/* Header */}
                <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-1">
                  <div className="w-9 h-9 rounded-full bg-[#F5C542] text-[#0F1928] font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {userInitials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{userName}</div>
                    <Badge variant="outline" className="border-[#F5C542]/30 text-[#F5C542] text-[9px] px-1.5 py-0 mt-0.5">
                      {currentRole.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Menu items */}
                {[
                  { icon: <User className="w-3.5 h-3.5" />, label: "My Profile", onClick: () => setProfileOpen(false) },
                  { icon: <Shield className="w-3.5 h-3.5" />, label: "Security Settings", onClick: () => setProfileOpen(false) },
                  { icon: <History className="w-3.5 h-3.5" />, label: "Login History", onClick: () => setProfileOpen(false) },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <span className="text-slate-400">{item.icon}</span>
                    {item.label}
                  </button>
                ))}

                <div className="h-px bg-white/5 my-1" />

                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); onLogout?.(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
