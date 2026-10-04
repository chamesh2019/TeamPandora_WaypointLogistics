"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  UserCheck,
  Truck,
  ClipboardList,
  CheckCircle2,
  Lock,
  Unlock,
  Edit2,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import type {
  DispatcherUserDto,
  DispatcherUsersKpisDto,
  DispatcherUserRole,
} from "@/lib/types/dispatcher-api";

function getRoleBadge(role: DispatcherUserRole) {
  switch (role) {
    case "dispatcher":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Dispatcher
        </span>
      );
    case "driver":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          Driver
        </span>
      );
    case "loader":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          Loader
        </span>
      );
    case "store_manager":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Store Manager
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
          {role}
        </span>
      );
  }
}

function getAvatarColors(role: DispatcherUserRole) {
  switch (role) {
    case "dispatcher":
      return { bg: "bg-[#F5C542]", text: "text-[#0F1928]" };
    case "driver":
      return { bg: "bg-purple-100", text: "text-purple-700" };
    case "loader":
      return { bg: "bg-sky-100", text: "text-sky-700" };
    case "store_manager":
      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-700" };
  }
}

export default function DispatcherUsersPage() {
  const [users, setUsers] = useState<DispatcherUserDto[]>([]);
  const [kpis, setKpis] = useState<DispatcherUsersKpisDto>({
    total: 0,
    dispatchers: 0,
    drivers: 0,
    loaders: 0,
    storeManagers: 0,
  });
  const [depots, setDepots] = useState<string[]>([]);
  const [outlets, setOutlets] = useState<Array<{ outletId: string; name: string }>>([]);

  const [roleFilter, setRoleFilter] = useState<"All" | DispatcherUserRole>("All");
  const [depotFilter, setDepotFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search query by 300ms to eliminate redundant requests and race conditions
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<DispatcherUserDto | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<DispatcherUserRole>("driver");
  const [newUserDepotId, setNewUserDepotId] = useState<string>("PELIYAGODA");
  const [newUserOutletId, setNewUserOutletId] = useState<string>("");
  const [newUserPhone, setNewUserPhone] = useState("");

  // Edit user form state
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<DispatcherUserRole>("driver");
  const [editDepotId, setEditDepotId] = useState<string>("");
  const [editOutletId, setEditOutletId] = useState<string>("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Locked">("Active");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "All") params.set("role", roleFilter);
      if (depotFilter !== "All") params.set("depotId", depotFilter);
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

      const res = await fetch(`/api/dispatcher/users?${params.toString()}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message || "Failed to load staff roster");
      }

      setUsers(json.data.users || []);
      setKpis(
        json.data.kpis || {
          total: 0,
          dispatchers: 0,
          drivers: 0,
          loaders: 0,
          storeManagers: 0,
        }
      );
      if (json.data.depots) setDepots(json.data.depots);
      if (json.data.outlets) {
        setOutlets(json.data.outlets);
        setNewUserOutletId((prev) => prev || json.data.outlets[0]?.outletId || "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, depotFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Sync edit modal state when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setEditName(editingUser.name);
      setEditRole(editingUser.role);
      setEditDepotId(editingUser.depotId || (depots[0] || "PELIYAGODA"));
      setEditOutletId(editingUser.outletId || (outlets[0]?.outletId || ""));
      setEditPhone(editingUser.phoneNumber || "");
      setEditStatus(editingUser.status);
    }
  }, [editingUser, depots, outlets]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dispatcher/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          username: newUserUsername,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          depotId: newUserRole === "store_manager" ? null : newUserDepotId || null,
          outletId: newUserRole === "store_manager" ? newUserOutletId || null : null,
          phoneNumber: newUserPhone || null,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || "Failed to create staff account");
      }

      triggerToast(`Account created for ${json.data.name} (@${json.data.username})`);
      setShowCreateModal(false);
      setNewUserName("");
      setNewUserUsername("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserPhone("");
      await fetchUsers();
    } catch (err: unknown) {
      triggerToast(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dispatcher/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          role: editRole,
          depotId: editRole === "store_manager" ? null : editDepotId || null,
          outletId: editRole === "store_manager" ? editOutletId || null : null,
          phoneNumber: editPhone || null,
          status: editStatus,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || "Failed to update profile");
      }

      triggerToast(`Updated profile for ${editName}`);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      triggerToast(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Lock/Unlock Handler
  const handleToggleLock = async (user: DispatcherUserDto) => {
    const targetStatus = user.status === "Locked" ? "Active" : "Locked";
    try {
      const res = await fetch("/api/dispatcher/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          status: targetStatus,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || "Failed to update user status");
      }

      triggerToast(
        targetStatus === "Locked"
          ? `Account for ${user.name} locked for security review`
          : `Account for ${user.name} unlocked successfully`
      );
      await fetchUsers();
    } catch (err: unknown) {
      triggerToast(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F1928] text-white px-4 py-3 rounded-lg shadow-xl border border-[#F5C542]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#F5C542] shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* Subheader: Title, Roster Count & Create user button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">User management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {kpis.total} operational staff · Waypoint Control Center
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchUsers()}
              disabled={isLoading}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh staff roster"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] text-xs font-bold px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0F1928]" />
              <span>Create user</span>
            </button>
          </div>
        </div>

        {/* 5 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total users</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {kpis.total}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Across all roles
              </div>
            </div>
            <div className="flex items-end gap-1 h-5 mt-3">
              {[28, 40, 52, 60, 48, 68, 74, 82, 90, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs ${i === 9 ? "bg-[#2563EB]" : "bg-[#D9E8F9]"}`}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Dispatchers */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Dispatchers</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {kpis.dispatchers}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Route & trip control
              </div>
            </div>
            <div className="flex items-end gap-1 h-5 mt-3">
              {[35, 45, 50, 65, 55, 70, 75, 80, 85, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs ${i === 9 ? "bg-[#F59E0B]" : "bg-[#FEF3C7]"}`}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Drivers */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Drivers</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {kpis.drivers}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Fleet operations
              </div>
            </div>
            <div className="flex items-end gap-1 h-5 mt-3">
              {[30, 42, 55, 60, 50, 72, 78, 85, 90, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs ${i === 9 ? "bg-[#7C3AED]" : "bg-[#EDE9FE]"}`}
                />
              ))}
            </div>
          </div>

          {/* Card 4: Loaders */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Loaders</span>
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {kpis.loaders}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Staging & verification
              </div>
            </div>
            <div className="flex items-end gap-1 h-5 mt-3">
              {[25, 38, 48, 55, 62, 70, 75, 82, 88, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs ${i === 9 ? "bg-[#0284C7]" : "bg-[#E0F2FE]"}`}
                />
              ))}
            </div>
          </div>

          {/* Card 5: Store Managers */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Store managers</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {kpis.storeManagers}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Outlet receiving
              </div>
            </div>
            <div className="flex items-end gap-1 h-5 mt-3">
              {[32, 45, 52, 60, 58, 68, 74, 80, 88, 100].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-xs ${i === 9 ? "bg-[#059669]" : "bg-[#D1FAE5]"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* MAIN USERS TABLE CARD */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header Controls: Filter Tabs, Depot Selector & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { label: "All", value: "All", count: kpis.total },
                { label: "Dispatcher", value: "dispatcher", count: kpis.dispatchers },
                { label: "Driver", value: "driver", count: kpis.drivers },
                { label: "Loader", value: "loader", count: kpis.loaders },
                { label: "Store Manager", value: "store_manager", count: kpis.storeManagers },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    roleFilter === tab.value
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-300/80 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      roleFilter === tab.value
                        ? "bg-slate-200 text-slate-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Depot Selector & Search Input */}
            <div className="flex items-center gap-2">
              <select
                value={depotFilter}
                onChange={(e) => setDepotFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#F5C542]"
              >
                <option value="All">All Depots</option>
                {depots.map((d) => (
                  <option key={d} value={d}>
                    Depot: {d}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff roster..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-56 focus:outline-none focus:border-[#F5C542] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Depot / Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                        <span>Loading staff accounts...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                      No staff members found matching the current filter.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const initials =
                      (user.name || "")
                        .trim()
                        .split(/\s+/)
                        .map((n) => n[0])
                        .filter(Boolean)
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "U";
                    const colors = getAvatarColors(user.role);

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. Name + Initials */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${colors.bg} ${colors.text} shrink-0 shadow-2xs`}
                            >
                              {initials}
                            </div>
                            <span className="font-bold text-slate-900">{user.name}</span>
                          </div>
                        </td>

                        {/* 2. Username */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          @{user.username}
                        </td>

                        {/* 3. Role */}
                        <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>

                        {/* 4. Contact */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-0.5 font-mono text-slate-600 text-[11px]">
                            {user.email && (
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                {user.email}
                              </span>
                            )}
                            {user.phoneNumber && (
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                {user.phoneNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Depot / Location */}
                        <td className="py-3.5 px-4">
                          {user.depotId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {user.depotId}
                            </span>
                          ) : user.outletId ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Building2 className="w-3 h-3 text-emerald-500" />
                              {outlets.find((o) => o.outletId === user.outletId)?.name || user.outletId}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Global</span>
                          )}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3.5 px-4">
                          {user.status === "Active" ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <span>Locked</span>
                            </span>
                          )}
                        </td>

                        {/* 7. Registered */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {user.createdAt ? user.createdAt.split("T")[0] : "—"}
                        </td>

                        {/* 8. Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-slate-400">
                            {/* Edit button */}
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                              title="Edit user details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Lock / Unlock button */}
                            <button
                              onClick={() => handleToggleLock(user)}
                              className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                              title={user.status === "Locked" ? "Unlock user account" : "Lock user account"}
                            >
                              {user.status === "Locked" ? (
                                <Unlock className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-500 hover:text-rose-500" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                <span>Create Staff User</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="my-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Senaratne"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ksenaratne"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as DispatcherUserRole)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-medium"
                  >
                    <option value="driver">Driver</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="loader">Loader</option>
                    <option value="store_manager">Store Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ksenaratne@waypoint.lk"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password * (min 8 characters)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {newUserRole === "store_manager" ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Outlet Assignment</label>
                    <select
                      value={newUserOutletId}
                      onChange={(e) => setNewUserOutletId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white text-[11px]"
                    >
                      {outlets.map((o) => (
                        <option key={o.outletId} value={o.outletId}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Depot Assignment</label>
                    <select
                      value={newUserDepotId}
                      onChange={(e) => setNewUserDepotId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-medium"
                    >
                      {depots.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0771234567"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
                Dual-synchronizes with Better Auth and the domain logistics tables for instant operational assignment.
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
                  disabled={isSubmitting}
                  className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Create User</span>
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
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as DispatcherUserRole)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-medium"
                  >
                    <option value="driver">Driver</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="loader">Loader</option>
                    <option value="store_manager">Store Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "Active" | "Locked")}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {editRole === "store_manager" ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Outlet Assignment</label>
                    <select
                      value={editOutletId}
                      onChange={(e) => setEditOutletId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white text-[11px]"
                    >
                      {outlets.map((o) => (
                        <option key={o.outletId} value={o.outletId}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Depot Assignment</label>
                    <select
                      value={editDepotId}
                      onChange={(e) => setEditDepotId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-medium"
                    >
                      {depots.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] font-mono"
                  />
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
                  disabled={isSubmitting}
                  className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
