"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Search,
  Bell,
  Clock,
  LogOut,
  Shield,
  History,
  ChevronDown,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type { Role } from "../../lib/types";

interface TopNavProps {
  currentRole?: Role;
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
}

const NAV_ROLES: { id: Role; label: string; href: string; count?: number }[] = [
  { id: "Dispatcher", label: "Dispatcher", href: "/dispatcher", count: 4 },
  { id: "Store Manager", label: "Store", href: "/store", count: 2 },
  { id: "Loader", label: "Dock Loader", href: "/loader", count: 3 },
  { id: "Driver", label: "Driver", href: "/driver" },
];

export function TopNav({
  currentRole = "Dispatcher",
  userName = "Kasun Perera",
  userInitials = "KP",
  onLogout,
}: TopNavProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0F1928] border-b border-white/5 shadow-md">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#F5C542] text-[#0F1928] font-extrabold flex items-center justify-center text-sm shadow-[0_0_14px_rgba(245,197,66,0.35)] group-hover:scale-105 transition-transform">
            W
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Waypoint
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
                OS
              </span>
            </div>
            <div className="text-[8px] font-semibold text-white/30 tracking-widest uppercase">
              Retail Distribution
            </div>
          </div>
        </Link>
      </div>

      {/* Role Navigation Pills */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-white/[0.07] rounded-full border border-white/5">
        {NAV_ROLES.map((role) => {
          const isActive = pathname.startsWith(role.href) || currentRole === role.id;
          return (
            <Link
              key={role.id}
              href={role.href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "bg-[#F5C542] text-[#0F1928] shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{role.label}</span>
              {role.count !== undefined && (
                <span
                  className={cn(
                    "w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center",
                    isActive ? "bg-[#0F1928]/20 text-[#0F1928]" : "bg-white/10 text-white/70"
                  )}
                >
                  {role.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Search, Notifications & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-full bg-white/[0.07] border border-white/10 text-white/50 focus-within:border-[#F5C542] focus-within:bg-white/10 transition-colors w-48">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-white/30"
          />
        </div>

        {/* Cutoff chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cutoff 16:00</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-[#0F1928]" />
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#F5C542] text-[#0F1928] font-bold text-xs flex items-center justify-center border-2 border-[#F5C542]/40 shadow-sm">
              {userInitials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-[#0F1928] border border-white/10 shadow-2xl z-50 text-slate-200">
              <div className="p-2.5 border-b border-white/10 mb-1">
                <div className="text-xs font-bold text-white">{userName}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="border-[#F5C542]/30 text-[#F5C542] text-[9px] px-1.5 py-0">
                    {currentRole}
                  </Badge>
                  <span className="text-[10px] text-white/40">Peliyagoda Hub</span>
                </div>
              </div>

              <Link
                href="/dispatcher/users"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Security & Roles</span>
              </Link>

              <button
                type="button"
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs hover:bg-white/5 text-slate-300 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Login History</span>
              </button>

              <div className="h-px bg-white/5 my-1" />

              <button
                type="button"
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                onClick={() => {
                  setProfileOpen(false);
                  if (onLogout) onLogout();
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
