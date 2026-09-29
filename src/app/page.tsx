"use client";

import React, { useState } from "react";
import {
  Button,
  StatusBadge,
  BrandTag,
  RoleHeaderBadge,
  CutoffChip,
  KpiChip,
  StatCard,
  Input,
  Select,
  Textarea,
  FieldLabel,
  ToggleSwitch,
  LightTabs,
  DarkTabs,
  FilterTabs,
  DonutGauge,
  FuelBar,
  Panel,
  PanelHeader,
  CountPill,
  DarkSection,
  DarkSectionHeader,
  DarkRow,
} from "@/components/design-system";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Truck,
  Package,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function ComponentShowcasePage() {
  const [lightTab, setLightTab] = useState("all");
  const [darkTab, setDarkTab] = useState("active");
  const [filterTab, setFilterTab] = useState("fresh");
  const [toggleState, setToggleState] = useState(true);
  const [inputText, setInputText] = useState("ORD-2026-001");
  const [selectedRow, setSelectedRow] = useState("row-1");

  return (
    <div className="min-h-screen bg-[#ECEEF5] dark:bg-[#07090e] text-[#0F1020] dark:text-white/90 p-4 sm:p-8 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.07] dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#F5C542] text-[#0F1928] font-extrabold flex items-center justify-center text-sm shadow-[0_0_14px_rgba(245,197,66,0.35)]">
                W
              </div>
              <RoleHeaderBadge>Figma 1:1 Design System</RoleHeaderBadge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1020] dark:text-white font-sans">
              Waypoint Component Library
            </h1>
            <p className="text-xs sm:text-sm text-[#7B7B9D] dark:text-slate-400 mt-1">
              Exact token-level matching of fonts (DM Sans / DM Mono), colors, shadows, and states.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <CutoffChip text="Daily Cutoff 16:00" />
            <KpiChip label="Design System" value="v1.0 Ready" />
          </div>
        </header>

        {/* Section 1: Buttons & Actions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F1020] dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
              1. Buttons & Action Primitives
            </h2>
            <span className="text-[10px] font-mono text-[#7B7B9D]">.primary, .secondary, .btn-create, .compact</span>
          </div>

          <div className="p-6 rounded-[14px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/10 shadow-[0_2px_12px_rgba(15,16,32,0.07)] flex flex-wrap items-center gap-3">
            <Button variant="primary">
              Primary Gold (.primary)
            </Button>
            <Button variant="secondary">
              Secondary Surface (.secondary)
            </Button>
            <Button variant="create">
              <Plus className="w-3.5 h-3.5" />
              Create Trip (.btn-create)
            </Button>
            <Button variant="compact">
              Compact Action (.compact)
            </Button>
            <Button variant="ghost">
              Ghost / Row Action
            </Button>
            <Button variant="danger">
              Danger Action
            </Button>
            <Button variant="primary" isLoading>
              Loading State
            </Button>
          </div>
        </section>

        {/* Section 2: Badges, Statuses & Brand Tags */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F1020] dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              2. Status Badges & Brand Tags
            </h2>
            <span className="text-[10px] font-mono text-[#7B7B9D]">1:1 Figma Color Variants</span>
          </div>

          <div className="p-6 rounded-[14px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/10 shadow-[0_2px_12px_rgba(15,16,32,0.07)] space-y-5">
            <div>
              <span className="block text-[10px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                Operational Status Badges
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="Planned" />
                <StatusBadge status="Draft" />
                <StatusBadge status="Active" />
                <StatusBadge status="Pending" />
                <StatusBadge status="Dispatched" />
                <StatusBadge status="Delivered" />
                <StatusBadge status="Resolved" />
                <StatusBadge status="Escalated" />
                <StatusBadge status="Incomplete" />
                <StatusBadge status="Unsent" />
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                Retail Brand Tags
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <BrandTag brand="Waypoint Fresh" />
                <BrandTag brand="Waypoint Style" />
                <BrandTag brand="Waypoint Tech" />
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                Special Chips & Role Badges
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <RoleHeaderBadge>Dispatcher Center</RoleHeaderBadge>
                <RoleHeaderBadge>Store Manager</RoleHeaderBadge>
                <CutoffChip text="Cutoff 16:00" />
                <KpiChip label="Peliyagoda Hub" value="Bay 03" />
                <FuelBar percentage={68} litersRemaining={280} />
                <FuelBar percentage={35} litersRemaining={110} />
                <FuelBar percentage={15} litersRemaining={35} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Stat Cards (KPIs with Sparklines) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F1020] dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4B8EF5]" />
              3. KPI Stat Cards (.stat-card)
            </h2>
            <span className="text-[10px] font-mono text-[#7B7B9D]">Micro-sparkline & Color Tones</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Confirmed Orders"
              value="148"
              trend={{ up: true, text: "+12% vs yesterday" }}
              note="14 Pending Cutoff Review"
              tone="yellow"
              bars={[30, 45, 60, 55, 75, 90, 85]}
            />
            <StatCard
              label="Active Fleet"
              value="18 / 22"
              trend={{ up: true, text: "81% Utilization" }}
              note="14 Reefer · 4 Ambient"
              tone="blue"
              bars={[60, 65, 70, 75, 80, 85, 81]}
            />
            <StatCard
              label="Weekly Fuel Quota"
              value="68%"
              trend={{ text: "Target &lt; 75%" }}
              note="Within Peliyagoda Limits"
              tone="green"
              bars={[80, 75, 72, 70, 69, 68, 68]}
            />
            <StatCard
              label="Exceptions & Claims"
              value="3"
              trend={{ up: false, text: "-2 resolved today" }}
              note="1 Multi-Skip Priority OUT003"
              tone="red"
              bars={[8, 6, 5, 4, 4, 3, 3]}
            />
          </div>
        </section>

        {/* Section 4: Form Controls & Inputs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F1020] dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              4. Inputs, Selects & Form Controls
            </h2>
            <span className="text-[10px] font-mono text-[#7B7B9D]">Figma Focus Rings & Labels</span>
          </div>

          <div className="p-6 rounded-[14px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/10 shadow-[0_2px_12px_rgba(15,16,32,0.07)] grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <FieldLabel>Order Reference</FieldLabel>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. ORD-2026-001"
              />
            </div>

            <div>
              <FieldLabel>Depot Hub Selection</FieldLabel>
              <Select defaultValue="peliyagoda">
                <option value="peliyagoda">Peliyagoda Distribution Center</option>
                <option value="kandy">Kandy Regional Hub</option>
              </Select>
            </div>

            <div>
              <FieldLabel>Toggle & States</FieldLabel>
              <div className="flex items-center gap-4 mt-2">
                <ToggleSwitch checked={toggleState} onChange={setToggleState} />
                <span className="text-xs font-semibold text-[#0F1020] dark:text-white">
                  {toggleState ? "Active / Enabled" : "Inactive / Disabled"}
                </span>
              </div>
            </div>

            <div className="sm:col-span-3">
              <FieldLabel>Discrepancy Notes / Instructions</FieldLabel>
              <Textarea placeholder="Enter receiving remarks or dock instructions..." />
            </div>
          </div>
        </section>

        {/* Section 5: Tab Switchers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F1020] dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
              5. Navigation Tabs (.tabs, .dark-tabs, .filter-tabs)
            </h2>
            <span className="text-[10px] font-mono text-[#7B7B9D]">Light Surface vs Dark Pills</span>
          </div>

          <div className="p-6 rounded-[14px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/10 shadow-[0_2px_12px_rgba(15,16,32,0.07)] space-y-6">
            <div>
              <span className="block text-[10px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                Light Tabs (.tabs .tab)
              </span>
              <LightTabs
                activeTab={lightTab}
                onSelect={setLightTab}
                tabs={[
                  { id: "all", label: "All Orders", count: 148 },
                  { id: "fresh", label: "Waypoint Fresh", count: 62 },
                  { id: "style", label: "Waypoint Style", count: 48 },
                  { id: "tech", label: "Waypoint Tech", count: 38 },
                ]}
              />
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                Dark Pill Tabs (.dark-tabs .dark-tab)
              </span>
              <div className="p-4 rounded-xl bg-[#0F1928] inline-block">
                <DarkTabs
                  activeTab={darkTab}
                  onSelect={setDarkTab}
                  tabs={[
                    { id: "active", label: "Active Trips", count: 8 },
                    { id: "planned", label: "Planned", count: 4 },
                    { id: "completed", label: "Completed", count: 12 },
                  ]}
                />
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                Filter Tabs (.filter-tabs .filter-tab)
              </span>
              <FilterTabs
                activeTab={filterTab}
                onSelect={setFilterTab}
                tabs={[
                  { id: "fresh", label: "Fresh Only" },
                  { id: "chilled", label: "Reefer Temp" },
                  { id: "ambient", label: "Ambient" },
                  { id: "exceptions", label: "Exceptions (3)" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Section 6: Dual Surface Panels & Donut Gauge */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F1020] dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
              6. Dual Surface Architecture (Light Panel vs Dark Section)
            </h2>
            <span className="text-[10px] font-mono text-[#7B7B9D]">.panel vs .dark-section</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Light Panel */}
            <div className="space-y-4">
              <Panel>
                <PanelHeader
                  title="Distribution Readiness Gauge"
                  subtitle="Peliyagoda Central Depot Outbound Staging"
                  badge={<CountPill count="82%" tone="green" />}
                />
                <div className="p-4">
                  <DonutGauge percentage={82} title="82%" subtitle="Readiness" />
                </div>
              </Panel>
            </div>

            {/* Dark Section */}
            <div>
              <DarkSection>
                <DarkSectionHeader
                  title="Active Trip Manifests"
                  subtitle="Live fleet tracking & dispatch sequence"
                  actions={<CountPill count="3 Active" tone="blue" />}
                />
                <div className="divide-y divide-white/[0.08]">
                  <DarkRow
                    avatarText="01"
                    title="TRIP-COL-01 · Reefer Truck VEH001"
                    subtitle="Stop #1: Waypoint Fresh Colombo OUT001 · Driver: Nimal F."
                    value="1,100 kg"
                    badge={<StatusBadge status="Active" />}
                    isSelected={selectedRow === "row-1"}
                    onClick={() => setSelectedRow("row-1")}
                  />
                  <DarkRow
                    avatarText="02"
                    title="TRIP-COL-02 · Ambient Box VEH002"
                    subtitle="Stop #1: Waypoint Tech Liberty OUT007 · Driver: Chamara S."
                    value="640 kg"
                    badge={<StatusBadge status="Planned" />}
                    isSelected={selectedRow === "row-2"}
                    onClick={() => setSelectedRow("row-2")}
                  />
                  <DarkRow
                    avatarText="03"
                    title="TRIP-KAN-01 · Small Van VEH003"
                    subtitle="Stop #1: Waypoint Style Kandy OUT004 · Driver: Ruwan D."
                    value="380 kg"
                    badge={<StatusBadge status="Delivered" />}
                    isSelected={selectedRow === "row-3"}
                    onClick={() => setSelectedRow("row-3")}
                  />
                </div>
              </DarkSection>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-black/[0.07] dark:border-white/10 text-xs text-[#7B7B9D] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Waypoint Group Logistics Platform · 1:1 Figma Design System</div>
          <div className="font-mono text-[11px]">Branch: feat/figma-design-system-and-structure</div>
        </footer>
      </div>
    </div>
  );
}
