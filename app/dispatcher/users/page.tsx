"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  GitFork,
  Route,
  Truck,
  Radio,
  AlertTriangle,
  Users,
  BarChart3,
  Sparkles,
  Search,
  Clock,
  Bell,
  Settings,
  Plus,
  Edit2,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Mail,
  ShieldCheck,
  UserCheck,
  AlertCircle,
} from "lucide-react";

interface LogisticsUser {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  employeeId: string;
  role: "Dispatcher" | "Driver" | "Loader" | "Store Manager";
  email: string;
  status: "Active" | "Inactive" | "Locked";
  lastLogin: string;
}

const INITIAL_USERS: LogisticsUser[] = [
  {
    id: "usr-001",
    name: "Kasun Perera",
    initials: "KP",
    avatarBg: "bg-[#F5C542]",
    avatarText: "text-[#0F1928]",
    employeeId: "EMP-0041",
    role: "Dispatcher",
    email: "kasun@waypoint.lk",
    status: "Active",
    lastLogin: "Today 09:14",
  },
  {
    id: "usr-002",
    name: "Nimal Perera",
    initials: "NP",
    avatarBg: "bg-purple-100",
    avatarText: "text-purple-700",
    employeeId: "EMP-0022",
    role: "Driver",
    email: "nimal@waypoint.lk",
    status: "Active",
    lastLogin: "Today 04:08",
  },
  {
    id: "usr-003",
    name: "Ravi Fernando",
    initials: "RF",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-700",
    employeeId: "EMP-0018",
    role: "Loader",
    email: "ravi@waypoint.lk",
    status: "Active",
    lastLogin: "Today 02:45",
  },
  {
    id: "usr-004",
    name: "Priya Samarawickrama",
    initials: "PS",
    avatarBg: "bg-emerald-100",
    avatarText: "text-emerald-700",
    employeeId: "EMP-0051",
    role: "Store Manager",
    email: "priya@waypoint.lk",
    status: "Active",
    lastLogin: "Yesterday 17:30",
  },
  {
    id: "usr-005",
    name: "Suresh Bandara",
    initials: "SB",
    avatarBg: "bg-purple-100",
    avatarText: "text-purple-700",
    employeeId: "EMP-0065",
    role: "Driver",
    email: "suresh@waypoint.lk",
    status: "Active",
    lastLogin: "Today 03:12",
  },
  {
    id: "usr-006",
    name: "Kamani Silva",
    initials: "KS",
    avatarBg: "bg-slate-100",
    avatarText: "text-slate-600",
    employeeId: "EMP-0033",
    role: "Loader",
    email: "kamani@waypoint.lk",
    status: "Inactive",
    lastLogin: "3 days ago",
  },
  {
    id: "usr-007",
    name: "Roshan Peris",
    initials: "RP",
    avatarBg: "bg-purple-100",
    avatarText: "text-purple-700",
    employeeId: "EMP-0048",
    role: "Driver",
    email: "roshan@waypoint.lk",
    status: "Locked",
    lastLogin: "5 days ago",
  },
  {
    id: "usr-008",
    name: "Dilani Jayawardena",
    initials: "DJ",
    avatarBg: "bg-emerald-100",
    avatarText: "text-emerald-700",
    employeeId: "EMP-0027",
    role: "Store Manager",
    email: "dilani@waypoint.lk",
    status: "Active",
    lastLogin: "Today 08:02",
  },
];

export default function DispatcherUsersPage() {
  const [activeNav, setActiveNav] = useState("Users");
  const [users, setUsers] = useState<LogisticsUser[]>(INITIAL_USERS);
  const [roleFilter, setRoleFilter] = useState<
    "All" | "Dispatcher" | "Driver" | "Loader" | "Store Manager"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<LogisticsUser | null>(null);
  const [resettingUser, setResettingUser] = useState<LogisticsUser | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<
    "Dispatcher" | "Driver" | "Loader" | "Store Manager"
  >("Driver");
  const [newUserEmpId, setNewUserEmpId] = useState("EMP-0089");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  // Metric counts
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === "Active").length;
  const lockedCount = users.filter((u) => u.status === "Locked").length;
  const driversCount = users.filter((u) => u.role === "Driver").length;

  // Toggle user lock/active status
  const handleToggleLock = (user: LogisticsUser) => {
    const newStatus = user.status === "Locked" ? "Active" : "Locked";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    triggerToast(
      newStatus === "Locked"
        ? `Account for ${user.name} locked for security review`
        : `Account for ${user.name} unlocked successfully`
    );
  };

  // Reset password
  const handleConfirmPasswordReset = () => {
    if (!resettingUser) return;
    triggerToast(`Temporary password generated and sent to ${resettingUser.email}`);
    setResettingUser(null);
  };

  // Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const initials = newUserName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newUser: LogisticsUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUserName,
      initials,
      avatarBg:
        newUserRole === "Dispatcher"
          ? "bg-[#F5C542]"
          : newUserRole === "Driver"
          ? "bg-purple-100"
          : newUserRole === "Loader"
          ? "bg-blue-100"
          : "bg-emerald-100",
      avatarText:
        newUserRole === "Dispatcher"
          ? "text-[#0F1928]"
          : newUserRole === "Driver"
          ? "text-purple-700"
          : newUserRole === "Loader"
          ? "text-blue-700"
          : "text-emerald-700",
      employeeId: newUserEmpId,
      role: newUserRole,
      email: newUserEmail,
      status: "Active",
      lastLogin: "Never (New)",
    };

    setUsers((prev) => [newUser, ...prev]);
    setShowCreateModal(false);
    setNewUserName("");
    setNewUserEmail("");
    triggerToast(`User account created for ${newUser.name}`);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    triggerToast(`Updated profile for ${editingUser.name}`);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-[#ECEEF5] text-[#0F1020] font-sans antialiased flex flex-col selection:bg-[#F5C542]/30 selection:text-[#0F1928]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F1928] text-white px-4 py-3 rounded-lg shadow-xl border border-[#F5C542]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#F5C542]" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#0F1928] border-b border-white/5 shadow-md">
        <div className="w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Group: Logo & Nav Links */}
          <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto no-scrollbar py-1">
            {/* Logo */}
            <Link href="/dispatcher" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-[#F5C542] text-[#0F1928] font-black flex items-center justify-center text-sm shadow-[0_0_14px_rgba(245,197,66,0.4)] group-hover:scale-105 transition-transform">
                W
              </div>
              <div className="leading-tight">
                <div className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1.5">
                  Waypoint
                </div>
                <div className="text-[8px] font-bold text-white/40 tracking-[0.18em] uppercase">
                  CONTROL
                </div>
              </div>
              {/* Badge 48 */}
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold border border-white/10">
                48
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              {/* 1. Overview */}
              <Link
                href="/dispatcher"
                onClick={() => setActiveNav("Overview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Overview"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </Link>

              {/* 2. Orders */}
              <Link
                href="/dispatcher/orders"
                onClick={() => setActiveNav("Orders")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Orders"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Orders</span>
                <span className="w-4 h-4 rounded-full bg-white/15 text-white/80 text-[9px] font-bold flex items-center justify-center">
                  12
                </span>
              </Link>

              {/* 3. Allocation */}
              <Link
                href="/dispatcher/allocation"
                onClick={() => setActiveNav("Allocation")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Allocation"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Allocation</span>
              </Link>

              {/* 4. Trip planning */}
              <Link
                href="/dispatcher/trip-planning"
                onClick={() => setActiveNav("Trip planning")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Trip planning"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Trip planning</span>
              </Link>

              {/* 5. Fleet */}
              <Link
                href="/dispatcher/fleet"
                onClick={() => setActiveNav("Fleet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Fleet"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Fleet</span>
              </Link>

              {/* 6. Live Routes */}
              <Link
                href="/dispatcher/live-routes"
                onClick={() => setActiveNav("Live Routes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Live Routes"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Live Routes</span>
              </Link>

              {/* 7. Exceptions */}
              <Link
                href="/dispatcher/exceptions"
                onClick={() => setActiveNav("Exceptions")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Exceptions"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Exceptions</span>
                <span className="w-4 h-4 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* 8. Users (ACTIVE PILL) */}
              <Link
                href="/dispatcher/users"
                onClick={() => setActiveNav("Users")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-[0_2px_8px_rgba(245,197,66,0.35)] ${
                  activeNav === "Users"
                    ? "bg-[#F5C542] text-[#0F1928]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users</span>
              </Link>

              {/* 9. Reports */}
              <Link
                href="/dispatcher/reports"
                onClick={() => setActiveNav("Reports")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Reports"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Reports</span>
              </Link>

              {/* 10. Forecast */}
              <Link
                href="/dispatcher/forecast"
                onClick={() => setActiveNav("Forecast")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Forecast"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
                <span>Forecast</span>
              </Link>
            </nav>
          </div>

          {/* Right Group: Search, Demo, Notifications, Settings, Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Search Input */}
            <div className="hidden xl:flex items-center gap-2 h-9 px-3.5 rounded-full bg-white/[0.07] border border-white/10 text-white/60 focus-within:border-[#F5C542] focus-within:bg-white/10 transition-colors w-52">
              <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders, trips..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-white/40 font-normal"
              />
            </div>

            {/* Demo Button */}
            <button
              type="button"
              onClick={() => triggerToast("Demo Mode: Simulation active")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span>Demo</span>
            </button>

            {/* Bell Icon with Red Dot */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => triggerToast("3 Active Operational Exceptions")}
              className="relative w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-[#0F1928]" />
            </button>

            {/* Settings Gear */}
            <button
              type="button"
              aria-label="Settings"
              onClick={() => triggerToast("User Directory & RBAC Security Settings")}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Avatar KP */}
            <div className="w-8 h-8 rounded-full bg-[#F5C542] text-[#0F1928] font-bold text-xs flex items-center justify-center border border-[#F5C542]/40 shadow-sm cursor-pointer hover:ring-2 hover:ring-[#F5C542]/50 transition-all">
              KP
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN USER MANAGEMENT CONTENT CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & + Create user button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">User management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {users.length} users · Waypoint Control Center
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* + Create user Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0F1928]" />
              <span>Create user</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total users */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total users</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {totalCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Across all roles
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[28, 38, 48, 42, 60, 52, 68, 62, 78].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D9E8F9] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#2563EB] rounded-xs" />
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Active</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {activeCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Logged in this week
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[25, 35, 45, 40, 58, 52, 68, 62, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D1FAE5] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#10B981] rounded-xs" />
            </div>
          </div>

          {/* Card 3: Locked */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Locked</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {lockedCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Failed login attempts
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[20, 30, 38, 48, 42, 60, 54, 68, 62].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#FEF3C7] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#F59E0B] rounded-xs" />
            </div>
          </div>

          {/* Card 4: Drivers */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Drivers</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {driversCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                2 on shift now
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[22, 32, 40, 48, 44, 60, 68, 74, 70].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#EDE9FE] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#7C3AED] rounded-xs" />
            </div>
          </div>
        </div>

        {/* MAIN USERS TABLE CARD */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header Controls: Filter Tabs & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  "All",
                  "Dispatcher",
                  "Driver",
                  "Loader",
                  "Store Manager",
                ] as const
              ).map((rf) => (
                <button
                  key={rf}
                  onClick={() => setRoleFilter(rf)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    roleFilter === rf
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-300/80"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {rf}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-56 focus:outline-none focus:border-[#F5C542] transition-all"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                      No users found matching the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Avatar + Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${user.avatarBg} ${user.avatarText} shrink-0 shadow-xs`}
                          >
                            {user.initials}
                          </div>
                          <span className="font-bold text-slate-900">{user.name}</span>
                        </div>
                      </td>

                      {/* 2. Employee ID */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {user.employeeId}
                      </td>

                      {/* 3. Role */}
                      <td className="py-3.5 px-4">
                        {user.role === "Dispatcher" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Dispatcher
                          </span>
                        )}
                        {user.role === "Driver" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                            Driver
                          </span>
                        )}
                        {user.role === "Loader" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                            Loader
                          </span>
                        )}
                        {user.role === "Store Manager" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Store Manager
                          </span>
                        )}
                      </td>

                      {/* 4. Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {user.email}
                      </td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-4">
                        {user.status === "Active" && (
                          <span className="inline-flex items-center gap-1.5 text-slate-800 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        )}
                        {user.status === "Inactive" && (
                          <span className="inline-flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span>Inactive</span>
                          </span>
                        )}
                        {user.status === "Locked" && (
                          <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Locked</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Last Login */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {user.lastLogin}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          {/* Edit button */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Key / Reset password */}
                          <button
                            onClick={() => setResettingUser(user)}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Reset password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock */}
                          <button
                            onClick={() => handleToggleLock(user)}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title={user.status === "Locked" ? "Unlock user" : "Lock user"}
                          >
                            {user.status === "Locked" ? (
                              <Unlock className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F5C542]" />
                <span>Create New User</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ashen Silva"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ashen@waypoint.lk"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                  >
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Driver">Driver</option>
                    <option value="Loader">Loader</option>
                    <option value="Store Manager">Store Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={newUserEmpId}
                    onChange={(e) => setNewUserEmpId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-500 text-[11px]">
                A welcome email with login instructions and a temporary password will be sent automatically.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit User · {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as any,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                  >
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Driver">Driver</option>
                    <option value="Loader">Loader</option>
                    <option value="Store Manager">Store Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Reset Password */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">{resettingUser.name}</p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                Generate a temporary passcode and password reset link for{" "}
                <strong>{resettingUser.email}</strong>?
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                Temporary Passcode: <span className="font-bold text-blue-600">WP-8924-SEC</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setResettingUser(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPasswordReset}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
