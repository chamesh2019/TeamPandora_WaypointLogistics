"use client";

import { useState } from "react";
import {
  Truck,
  Store,
  ClipboardList,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Database,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const ROLES = [
  {
    id: "dispatcher",
    name: "Dispatcher",
    roleTitle: "Planning & Allocation Center",
    username: "dispatcher",
    password: "dispatch123",
    officer: "Sarath Gunawardena",
    location: "Peliyagoda Planning Office",
    icon: ClipboardList,
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    gradient: "from-blue-600/20 via-sky-500/10 to-transparent",
    description:
      "Automated and manual order-to-trip allocation, fleet capacity constraints, fuel quota tracking, and multi-skip anti-starvation enforcement.",
    primaryActions: [
      "Trip Allocation Matrix",
      "Fleet Quota Monitor",
      "Daily 4:00 PM Cutoff Review",
      "Order Deferral Manager",
    ],
  },
  {
    id: "loader",
    name: "Dock Loader",
    roleTitle: "Warehouse Outbound Operations",
    username: "loader",
    password: "loader123",
    officer: "Sunil Jayasinghe",
    location: "Peliyagoda Loading Dock Bay 3",
    icon: PackageCheck,
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    gradient: "from-amber-600/20 via-orange-500/10 to-transparent",
    description:
      "Reverse delivery sequence packing, reefer temperature verification, short-pick recording, and digital dock clearance manifests.",
    primaryActions: [
      "Reverse Load List",
      "Loading Exception Tally",
      "Vehicle Dispatch Sign-Off",
      "Pallet Space Verification",
    ],
  },
  {
    id: "driver",
    name: "Fleet Driver",
    roleTitle: "Mobile Route & POD Execution",
    username: "driver",
    password: "driver123",
    officer: "Nimal Fernando",
    location: "Reefer Truck VEH001 · Colombo District",
    icon: Truck,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    gradient: "from-emerald-600/20 via-teal-500/10 to-transparent",
    description:
      "Turn-by-turn stop execution, live arrival timestamps, digital signatures, temperature logging, and proof-of-delivery (POD) photo capture.",
    primaryActions: [
      "Assigned Trip Route",
      "Store Arrival Verification",
      "Electronic Proof of Delivery",
      "Dock Unload Discrepancy",
    ],
  },
  {
    id: "store_manager",
    name: "Store Manager",
    roleTitle: "Retail Outlet Receipt & Orders",
    username: "store_manager",
    password: "store123",
    officer: "Anura Silva",
    location: "Waypoint Fresh OUT001 · Colombo Central",
    icon: Store,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    gradient: "from-purple-600/20 via-fuchsia-500/10 to-transparent",
    description:
      "Pre-4:00 PM stock ordering, live inbound delivery ETA monitoring, two-category intake (Fresh chilled vs. ambient), and immediate claim disputes.",
    primaryActions: [
      "Daily Order Placement",
      "Live Inbound Track & ETA",
      "Dock Receipt Confirmation",
      "Quality Discrepancy Claims",
    ],
  },
];

const BRANDS = [
  {
    name: "Waypoint Fresh",
    tagline: "Perishable Groceries & Chilled Goods",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    badge: "Chilled & Ambient",
    depots: "Peliyagoda & Kandy",
  },
  {
    name: "Waypoint Style",
    tagline: "Fashion & Soft Goods Apparel",
    color: "text-pink-400",
    border: "border-pink-500/30",
    badge: "Ambient Only",
    depots: "Peliyagoda DC",
  },
  {
    name: "Waypoint Tech",
    tagline: "Consumer Electronics & Appliances",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    badge: "High-Value Ambient",
    depots: "Peliyagoda DC",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("dispatcher");

  return (
    <div className="relative min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500/30">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-blue-500/15 to-transparent blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-gradient-to-br from-emerald-600/15 via-teal-500/10 to-transparent blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation / Header */}
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Waypoint Group
                </span>
                <Badge
                  variant="outline"
                  className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-[11px]"
                >
                  Logistics Platform
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Shared Retail Distribution · Tech-Triathlon 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL 16 Connected
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-white/10 bg-white/5 px-3 py-1 text-slate-300"
            >
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              Daily Cutoff 16:00
            </Badge>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 sm:py-16 text-center lg:text-left">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-4">
                <Sparkles className="h-3.5 w-3.5" /> Next.js 16 + Tailwind CSS + shadcn/ui Initialized
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
                Intelligent Fleet &{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Delivery Operations
                </span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                A unified multi-tenant distribution backbone connecting Peliyagoda and Kandy
                regional hubs to 3 retail brands. Enforcing capacity limits, reefer cold-chain
                compliance, and digital proof-of-delivery across all operational tiers.
              </p>

              {/* Quick stats pills */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    Hubs
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">2 Depots</div>
                  <div className="text-[11px] text-slate-400">Peliyagoda & Kandy</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Store className="h-3.5 w-3.5 text-pink-400" />
                    Brands
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">3 Lines</div>
                  <div className="text-[11px] text-slate-400">Fresh · Style · Tech</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Truck className="h-3.5 w-3.5 text-emerald-400" />
                    Fleet
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">Dual Mode</div>
                  <div className="text-[11px] text-slate-400">Reefer & Ambient</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                    Roles
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">4 Seeded</div>
                  <div className="text-[11px] text-slate-400">Judge Walkthrough</div>
                </div>
              </div>
            </div>

            {/* Quick credentials card */}
            <div className="lg:col-span-5">
              <Card className="border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-2xl backdrop-blur-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-indigo-400/40 text-indigo-300">
                      Walkthrough Ready
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">db/02-seed.sql</span>
                  </div>
                  <CardTitle className="text-lg text-white">Seeded Hackathon Accounts</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Quick credentials for evaluation and screen verification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0">
                  {ROLES.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setActiveTab(r.id)}
                      className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                        activeTab === r.id
                          ? "border-indigo-500/50 bg-indigo-500/15"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <r.icon className="h-4 w-4 text-indigo-400" />
                          <span className="text-sm font-semibold text-white">{r.name}</span>
                        </div>
                        <span className="font-mono text-xs text-slate-400">
                          {r.username} / {r.password}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{r.officer}</span>
                        <span className="truncate max-w-[160px] text-slate-400">{r.location}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Role Portals (shadcn Tabs) */}
        <section className="py-8">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Operational Roles & Workflows
            </h2>
            <p className="text-sm text-slate-400">
              Select a role to inspect dedicated input forms, live views, and operational responsibilities.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/5 border border-white/10 p-1">
              {ROLES.map((role) => (
                <TabsTrigger
                  key={role.id}
                  value={role.id}
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs sm:text-sm font-medium transition-all"
                >
                  <role.icon className="h-4 w-4 mr-2" />
                  {role.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLES.map((role) => (
              <TabsContent key={role.id} value={role.id} className="mt-6">
                <Card className={`border-white/10 bg-gradient-to-br ${role.gradient} to-black/40 backdrop-blur-md`}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-white/10 border border-white/10">
                          <role.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-white">{role.name} Portal</CardTitle>
                          <CardDescription className="text-slate-300 text-xs mt-0.5">
                            {role.roleTitle} · {role.location}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={role.badgeColor}>
                        User: {role.officer}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed">{role.description}</p>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Key Capabilities & Screens
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {role.primaryActions.map((action, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-2.5 text-xs font-medium text-slate-200"
                          >
                            <span>{action}</span>
                            <ArrowRight className="h-3 w-3 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                    <span className="font-mono">
                      Credentials: <strong className="text-white">{role.username}</strong> /{" "}
                      <strong className="text-white">{role.password}</strong>
                    </span>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 text-xs">
                      Open {role.name} Dashboard
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Brand Network Specs */}
        <section className="py-8 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Retail Brand Network Policies</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {BRANDS.map((brand, i) => (
              <Card key={i} className="border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-base font-bold ${brand.color}`}>
                      {brand.name}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] ${brand.border}`}>
                      {brand.badge}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    {brand.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Active Hubs: {brand.depots}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Waypoint Group Logistics Platform · Next.js 16 (Turbopack) & shadcn/ui</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              PostgreSQL 16 Schema Active
            </span>
            <Separator orientation="vertical" className="h-4 bg-white/10" />
            <span>Rootcode Tech-Triathlon 2026</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
