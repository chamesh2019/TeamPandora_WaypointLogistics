"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { DarkTabs } from "../design-system";
import {
  Bell,
  ChevronDown,
  History,
  LogOut,
  Menu,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useSession } from "../../lib/auth-client";
import { cn } from "../../lib/utils";
import type { Role } from "../../lib/types";

export interface HeaderNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  count?: number;
}

export interface HeaderProps {
  navItems: HeaderNavItem[];
  activeHref?: string;
  currentRole?: Role;
  userName?: string;
  userInitials?: string;
  brandName?: string;
  brandSubtitle?: string;
  homeHref?: string;
  onProfile?: () => void;
  onSecuritySettings?: () => void;
  onLoginHistory?: () => void;
  onLogout?: () => void;
  className?: string;
}

function matchesHref(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function resolveActiveHref(
  pathname: string | null,
  navItems: HeaderNavItem[],
  activeHrefOverride?: string,
): string | undefined {
  if (activeHrefOverride) {
    return activeHrefOverride;
  }
  if (!pathname) {
    return navItems[0]?.href;
  }
  const exactMatch = navItems.find((item) => pathname === item.href);
  if (exactMatch) {
    return exactMatch.href;
  }
  const matchingItems = navItems
    .filter((item) => matchesHref(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length);
  return matchingItems[0]?.href ?? navItems[0]?.href;
}

function formatRoleLabel(role?: string | null) {
  if (!role) {
    return "Role";
  }

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInitials(name?: string | null) {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Header({
  navItems,
  activeHref: activeHrefOverride,
  currentRole,
  userName,
  userInitials,
  brandName = "Waypoint",
  brandSubtitle = "Logistics",
  homeHref = "/",
  onProfile,
  onSecuritySettings,
  onLoginHistory,
  onLogout,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const sessionUser = session?.user;
  const displayName =
    sessionUser?.name ?? userName ?? sessionUser?.username ?? "User";
  const displayRole = formatRoleLabel(
    (sessionUser as { role?: string } | undefined)?.role ?? currentRole ?? null,
  );
  const displayInitials = getInitials(displayName) || userInitials || "?";

  const activeHref = useMemo(() => {
    return resolveActiveHref(pathname, navItems, activeHrefOverride);
  }, [activeHrefOverride, navItems, pathname]);

  const navTabs = navItems.map((item) => ({
    id: item.href,
    label: item.name,
    count: item.count,
    icon: item.icon,
  }));

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-30" ref={menuRef}>
      <header
        className={cn(
          "flex h-16.5 items-center gap-4 border-b border-white/5 bg-[#0F1928] px-4 shadow-[0_2px_20px_rgba(0,0,0,.25)] sm:px-6",
          className,
        )}
      >
        {/* Brand logo */}
        <Link
          href={homeHref}
          className="flex shrink-0 items-center gap-2.5 group"
        >
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[10px] bg-[#F5C542] text-[17px] font-extrabold text-[#0F1928] shadow-[0_0_16px_rgba(245,197,66,0.35)] transition-transform group-hover:scale-105">
            W
          </div>
          <div className="grid gap-0">
            <div className="flex items-center gap-1.5 text-[14px] font-bold leading-[1.1] text-[#EBF0FF]">
              {brandName}
            </div>
            <div className="text-[8px] font-semibold uppercase tracking-widest text-white/30">
              {brandSubtitle}
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex w-fit max-w-full shrink-0 items-center overflow-x-auto">
          <DarkTabs
            activeTab={activeHref ?? navItems[0]?.href ?? "/"}
            onSelect={(tabId) => router.push(tabId)}
            tabs={navTabs}
            className="shrink-0"
          />
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-3">
          {/* Search — desktop only */}
          <div className="hidden h-9 w-48 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 text-white/50 transition-colors focus-within:border-[#F5C542] focus-within:bg-white/10 lg:flex">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <input
              type="text"
              placeholder="Search orders, trips..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#0F1928] bg-rose-500" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#F5C542]/40 bg-[#F5C542] text-xs font-bold text-[#0F1928] shadow-sm">
                {displayInitials}
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-white/40 sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#0F1928] p-1.5 text-slate-200 shadow-2xl">
                <div className="mb-1 border-b border-white/10 p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#F5C542]/40 bg-[#F5C542] text-sm font-bold text-[#0F1928] shadow-sm">
                      {displayInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white">
                        {displayName}
                      </div>
                      <div className="mt-1 inline-flex items-center rounded-full border border-[#F5C542]/30 bg-[#F5C542]/10 px-1.5 py-0 text-[9px] font-bold uppercase tracking-widest text-[#F5C542]">
                        {displayRole}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-white/5"
                  onClick={() => {
                    setProfileOpen(false);
                    onProfile?.();
                  }}
                >
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 transition-colors hover:bg-white/5"
                  onClick={() => {
                    setProfileOpen(false);
                    onSecuritySettings?.();
                  }}
                >
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Security Settings</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 transition-colors hover:bg-white/5"
                  onClick={() => {
                    setProfileOpen(false);
                    onLoginHistory?.();
                  }}
                >
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  <span>Login History</span>
                </button>

                <div className="my-1 h-px bg-white/5" />

                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-rose-400 transition-colors hover:bg-rose-500/10"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Hamburger toggle — mobile only */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/5 bg-[#0F1928] shadow-[0_4px_20px_rgba(0,0,0,.35)]">
          {/* Mobile search */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex h-9 w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 text-white/50 transition-colors focus-within:border-[#F5C542] focus-within:bg-white/10">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Search orders, trips..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Mobile nav links */}
          <nav className="flex flex-col gap-0.5 px-3 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = matchesHref(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#F5C542]/10 text-[#F5C542]"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                  {item.count != null && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5C542]/20 px-1.5 text-[10px] font-bold text-[#F5C542]">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
