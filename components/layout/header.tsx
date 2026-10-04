"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { DarkTabs } from "../design-system";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  History,
  Loader2,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  Truck,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "../../lib/auth-client";
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<{
    orders: Array<{ id: string; title: string; subtitle: string; href: string }>;
    trips: Array<{ id: string; title: string; subtitle: string; href: string }>;
  }>({ orders: [], trips: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const matchedNavItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return navItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
    );
  }, [navItems, searchQuery]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setApiResults({ orders: [], trips: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setApiResults(json.data);
          }
        }
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleExecuteSearch = (targetHref?: string) => {
    setSearchOpen(false);
    setMobileMenuOpen(false);

    if (targetHref) {
      router.push(targetHref);
      return;
    }

    const q = searchQuery.trim();
    if (!q) return;

    if (pathname?.startsWith("/store")) {
      router.push(`/store/orders?search=${encodeURIComponent(q)}`);
    } else if (pathname?.startsWith("/loader")) {
      router.push(`/loader/manifests?search=${encodeURIComponent(q)}`);
    } else {
      router.push(`/dispatcher/orders?search=${encodeURIComponent(q)}`);
    }
  };

  const allResults = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle?: string;
      href: string;
      type: "page" | "order" | "trip";
      icon: LucideIcon;
    }> = [];
    matchedNavItems.forEach((item) => {
      list.push({
        id: `page-${item.href}`,
        title: item.name,
        subtitle: `Navigation · ${item.href}`,
        href: item.href,
        type: "page",
        icon: item.icon,
      });
    });
    apiResults.orders.forEach((ord) => {
      list.push({
        id: `ord-${ord.id}`,
        title: ord.title,
        subtitle: ord.subtitle,
        href: ord.href,
        type: "order",
        icon: Package,
      });
    });
    apiResults.trips.forEach((trp) => {
      list.push({
        id: `trp-${trp.id}`,
        title: trp.title,
        subtitle: trp.subtitle,
        href: trp.href,
        type: "trip",
        icon: Truck,
      });
    });
    return list;
  }, [apiResults, matchedNavItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchOpen) {
      if (e.key === "ArrowDown" && searchQuery.trim()) {
        setSearchOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev + 1 < allResults.length ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : allResults.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && allResults[selectedIndex]) {
        handleExecuteSearch(allResults[selectedIndex].href);
      } else if (allResults.length > 0) {
        handleExecuteSearch(allResults[0].href);
      } else {
        handleExecuteSearch();
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);

    try {
      setIsLoggingOut(true);
      if (onLogout) {
        await onLogout();
      } else {
        await signOut();
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };
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

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMobileMenuOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target) &&
        (!mobileSearchContainerRef.current ||
          !mobileSearchContainerRef.current.contains(target))
      ) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const renderSearchDropdown = (isMobile = false) => {
    if (!searchOpen || !searchQuery.trim()) return null;

    const hasResults = allResults.length > 0;

    return (
      <div
        className={cn(
          "absolute top-full z-50 mt-2 rounded-xl border border-white/10 bg-[#0F1928] p-2 text-slate-200 shadow-2xl backdrop-blur-md",
          isMobile ? "left-4 right-4 w-auto" : "left-0 w-80 sm:w-96",
        )}
      >
        {isSearching && allResults.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-white/50">
            <Loader2 className="h-4 w-4 animate-spin text-[#F5C542]" />
            <span>Searching...</span>
          </div>
        ) : hasResults ? (
          <div className="max-h-80 overflow-y-auto space-y-1">
            {/* Pages Section */}
            {matchedNavItems.length > 0 && (
              <div className="mb-2">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Navigation
                </div>
                {matchedNavItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleExecuteSearch(item.href)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[#F5C542]/20 text-[#F5C542] font-semibold"
                          : "text-slate-200 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-[#F5C542]">
                        <ItemIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.count != null && (
                        <span className="rounded-full bg-[#F5C542]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#F5C542]">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Orders Section */}
            {apiResults.orders.length > 0 && (
              <div className="mb-2">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Orders
                </div>
                {apiResults.orders.map((ord, idx) => {
                  const itemIndex = matchedNavItems.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => handleExecuteSearch(ord.href)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[#F5C542]/20 text-[#F5C542] font-semibold"
                          : "text-slate-200 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-amber-400">
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-white">
                          {ord.title}
                        </div>
                        <div className="truncate text-[10px] text-white/50">
                          {ord.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trips Section */}
            {apiResults.trips.length > 0 && (
              <div className="mb-2">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Trips
                </div>
                {apiResults.trips.map((trp, idx) => {
                  const itemIndex =
                    matchedNavItems.length + apiResults.orders.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={trp.id}
                      type="button"
                      onClick={() => handleExecuteSearch(trp.href)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-[#F5C542]/20 text-[#F5C542] font-semibold"
                          : "text-slate-200 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-blue-400">
                        <Truck className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-white">
                          {trp.title}
                        </div>
                        <div className="truncate text-[10px] text-white/50">
                          {trp.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 px-3 text-center text-xs text-white/50">
            No direct matches for &quot;{searchQuery}&quot;
          </div>
        )}

        {/* Action footer: Search everywhere */}
        <div className="border-t border-white/10 pt-1.5 mt-1">
          <button
            type="button"
            onClick={() => handleExecuteSearch()}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-[#F5C542] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="truncate">
              Search all orders for &quot;{searchQuery}&quot;
            </span>
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <span className="rounded bg-white/10 px-1 py-0.5 font-mono">
                ↵ Enter
              </span>
              <ArrowRight className="h-3 w-3 text-[#F5C542]" />
            </div>
          </button>
        </div>
      </div>
    );
  };

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
        <nav className="hidden lg:flex w-fit max-w-full min-w-0 items-center overflow-x-auto">
          <DarkTabs
            activeTab={activeHref ?? navItems[0]?.href ?? "/"}
            onSelect={(tabId) => router.push(tabId)}
            tabs={navTabs}
            className="shrink-0"
          />
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {/* Search — desktop only */}
          <div className="relative hidden lg:block" ref={searchContainerRef}>
            <div className="flex h-9 w-52 xl:w-68 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 text-white/50 transition-colors focus-within:border-[#F5C542] focus-within:bg-white/10">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search orders, trips, pages..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setSearchOpen(true);
                }}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
              />
              {isSearching ? (
                <Loader2 className="h-3 w-3 animate-spin text-[#F5C542] shrink-0" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  className="text-white/40 hover:text-white text-xs p-0.5 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
            {renderSearchDropdown(false)}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setProfileOpen(false);
              }}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                notificationsOpen && "bg-white/10 text-white",
              )}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#0F1928] bg-rose-500" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-70 rounded-xl border border-white/10 bg-[#0F1928] p-1.5 text-slate-200 shadow-2xl">
                <div className="mb-1 border-b border-white/10 px-3 py-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
                    Notifications
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/40">
                    Store activity alerts
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/3 px-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F5C542]/35 bg-[#F5C542]/12 text-[#F5C542]">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/90">
                      No new notifications
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/45">
                      You are all caught up for now.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
              }}
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => {
                    setProfileOpen(false);
                    if (onProfile) {
                      onProfile();
                    } else {
                      router.push("/profile");
                    }
                  }}
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>My Profile</span>
                </button>

                {/* <button
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
                </button> */}

                <div className="my-1 h-px bg-white/5" />

                <button
                  type="button"
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Hamburger toggle — mobile only */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
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
        <div className="lg:hidden border-b border-white/5 bg-[#0F1928] shadow-[0_4px_20px_rgba(0,0,0,.35)]">
          {/* Mobile search */}
          <div className="relative px-4 pt-3 pb-2" ref={mobileSearchContainerRef}>
            <div className="flex h-9 w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 text-white/50 transition-colors focus-within:border-[#F5C542] focus-within:bg-white/10">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Search orders, trips, pages..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setSearchOpen(true);
                }}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
              />
              {isSearching ? (
                <Loader2 className="h-3 w-3 animate-spin text-[#F5C542] shrink-0" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="text-white/40 hover:text-white text-xs p-0.5 rounded-full cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
            {renderSearchDropdown(true)}
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

            <div className="my-1.5 h-px bg-white/10" />

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onProfile) {
                  onProfile();
                } else {
                  router.push("/profile");
                }
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <User className="h-4 w-4 shrink-0 text-slate-400" />
              <span>My Profile</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
