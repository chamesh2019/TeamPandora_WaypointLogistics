"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Building2,
  MapPin,
  Lock,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import Header from "@/components/layout/header";
import type { Role } from "@/lib/types";
import {
  Panel,
  PanelHeader,
  Button,
  Input,
  FieldLabel,
  RoleHeaderBadge,
} from "@/components/design-system";
import { useSession, changePassword } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/* ─── Types ────────────────────────────────────────────────── */

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  username: string;
  displayUsername?: string;
  role: string;
  depotId?: string | null;
  outletId?: string | null;
  phoneNumber?: string | null;
  image?: string | null;
  emailVerified?: boolean;
}

/* ─── Avatar Color Presets ─────────────────────────────────── */

const AVATAR_PRESETS = [
  { id: "gold", label: "Waypoint Gold", bg: "bg-[#F5C542]", text: "text-[#0F1928]", border: "border-[#F5C542]" },
  { id: "emerald", label: "Fleet Captain", bg: "bg-emerald-500", text: "text-white", border: "border-emerald-400" },
  { id: "indigo", label: "Dispatcher Pro", bg: "bg-indigo-600", text: "text-white", border: "border-indigo-400" },
  { id: "amber", label: "Store Lead", bg: "bg-amber-500", text: "text-white", border: "border-amber-400" },
  { id: "cyan", label: "Dock Specialist", bg: "bg-cyan-600", text: "text-white", border: "border-cyan-400" },
  { id: "purple", label: "Logistics Ops", bg: "bg-purple-600", text: "text-white", border: "border-purple-400" },
];

/* ─── Role to Dashboard Route ──────────────────────────────── */

function getDashboardRoute(role?: string | null) {
  switch (role) {
    case "store_manager":
      return "/store";
    case "loader":
      return "/loader";
    case "driver":
      return "/driver";
    default:
      return "/dispatcher";
  }
}

/* ─── Profile Page Component ───────────────────────────────── */

export default function ProfilePage() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<"details" | "security">("details");

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarPreset, setAvatarPreset] = useState("gold");
  const [imageUrl, setImageUrl] = useState("");
  const [customAvatarActive, setCustomAvatarActive] = useState(false);

  // Initial loaded data for dirty check / reset
  const [originalData, setOriginalData] = useState<UserProfileData | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Page Status
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ── Load Profile Data ───────────────────────────────────── */

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data: UserProfileData = json.data;
            setOriginalData(data);
            setName(data.name || "");
            setEmail(data.email || "");
            setPhoneNumber(data.phoneNumber || "");

            if (data.image) {
              if (data.image.startsWith("preset:")) {
                setAvatarPreset(data.image.replace("preset:", ""));
                setCustomAvatarActive(false);
              } else {
                setImageUrl(data.image);
                setCustomAvatarActive(true);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session]);

  /* ── Derived Identity Info ───────────────────────────────── */

  const sessionUser = session?.user;
  const currentRole = (sessionUser as { role?: string } | undefined)?.role || originalData?.role || "dispatcher";

  const userInitials = useMemo(() => {
    const targetName = name || sessionUser?.name || "User";
    return targetName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";
  }, [name, sessionUser?.name]);

  const roleFormatted = useMemo(() => {
    return currentRole
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [currentRole]);

  const locationLabel = useMemo(() => {
    if (originalData?.outletId) {
      return `${originalData.outletId} · Bambalapitiya Fresh`;
    }
    if (originalData?.depotId === "KANDY") {
      return "Kandy Regional Distribution Hub";
    }
    return "Peliyagoda Central Distribution Hub";
  }, [originalData]);

  const dashboardRoute = getDashboardRoute(currentRole);

  /* ── Form Actions ────────────────────────────────────────── */

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", text: "Full name cannot be empty." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const chosenImage = customAvatarActive && imageUrl.trim()
      ? imageUrl.trim()
      : `preset:${avatarPreset}`;

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          image: chosenImage,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setOriginalData(json.data);
        setFeedback({
          type: "success",
          text: "Profile customizations saved successfully. Changes are now active across your workspace.",
        });
      } else {
        setFeedback({
          type: "error",
          text: json.error?.message || "Failed to save profile. Please check the inputs and try again.",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "A network error occurred while updating profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setName(originalData.name || "");
      setEmail(originalData.email || "");
      setPhoneNumber(originalData.phoneNumber || "");
      if (originalData.image?.startsWith("preset:")) {
        setAvatarPreset(originalData.image.replace("preset:", ""));
        setCustomAvatarActive(false);
      } else if (originalData.image) {
        setImageUrl(originalData.image);
        setCustomAvatarActive(true);
      }
    }
    setFeedback(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (res?.error) {
        setPasswordMessage({
          type: "error",
          text: res.error.message || "Failed to update password. Verify your current password.",
        });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Password updated successfully. Your new credentials are now active.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An unexpected error occurred while changing password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const selectedPresetConfig = AVATAR_PRESETS.find((p) => p.id === avatarPreset) || AVATAR_PRESETS[0];

  const profileNavItems = [
    { name: "My Profile", href: "/profile", icon: User },
  ];

  /* ── Render ──────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <>
        <Header
          navItems={profileNavItems}
          activeHref="/profile"
          brandName="Waypoint"
          brandSubtitle="User Settings"
          userName={name || sessionUser?.name || "User"}
          currentRole={roleFormatted as Role}
          homeHref={dashboardRoute}
        />
        <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px] flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5C542] border-t-transparent" />
              <span className="text-xs font-semibold text-[#747B93]">Loading profile data...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        navItems={profileNavItems}
        activeHref="/profile"
        brandName="Waypoint"
        brandSubtitle="User Settings"
        userName={name || sessionUser?.name || "User"}
        currentRole={roleFormatted as Role}
        homeHref={dashboardRoute}
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Top Navigation & Action Bar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link
              href={dashboardRoute}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7EAF0] bg-white px-3 py-2 text-[12px] font-semibold text-[#0F1020] shadow-[0_1px_2px_rgba(15,16,32,0.04)] transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                className="px-3 py-2 text-[12px] font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={isSaving}
                onClick={() => handleSaveProfile()}
                className="px-4 py-2 text-[12px] font-bold"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={cn(
                "mb-5 flex items-center gap-3 rounded-xl border p-4 text-xs font-semibold shadow-sm transition-all",
                feedback.type === "success"
                  ? "border-[#10B981]/20 bg-[#ECFDF5] text-[#047857]"
                  : "border-[#EF4444]/20 bg-[#FEF2F2] text-[#DC2626]"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444]" />
              )}
              <span className="flex-1">{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Hero Profile Banner */}
          <div className="mb-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)]">
            <div className="h-28 w-full bg-linear-to-r from-[#0F1928] via-[#1A2638] to-[#0F1928] p-6 relative">
              <div className="absolute right-6 top-5 hidden items-center gap-2 sm:flex">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Session
                </span>
              </div>
            </div>

            <div className="relative px-6 pb-6 pt-2">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between -mt-12">
                {/* Avatar Preview */}
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:gap-4">
                  <div className="relative shrink-0">
                    {customAvatarActive && imageUrl.trim() ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageUrl.trim()}
                        alt={name}
                        className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
                        onError={() => setCustomAvatarActive(false)}
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white text-2xl font-black shadow-md transition-all",
                          selectedPresetConfig.bg,
                          selectedPresetConfig.text
                        )}
                      >
                        {userInitials}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F1928] text-white shadow-sm ring-2 ring-white">
                      <Sparkles className="h-3 w-3 text-[#F5C542]" />
                    </div>
                  </div>

                  <div className="md:mb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-extrabold text-[#0F1020] sm:text-2xl">
                        {name || sessionUser?.name || "User Profile"}
                      </h2>
                      <RoleHeaderBadge>{roleFormatted}</RoleHeaderBadge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#747B93]">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                        @{originalData?.username || sessionUser?.username || "user"}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {locationLabel}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {email || sessionUser?.email || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center rounded-lg bg-[#F5F6FB] p-1 border border-black/[0.07]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all",
                      activeTab === "details"
                        ? "bg-white text-[#0F1020] shadow-sm"
                        : "text-[#7B7B9D] hover:text-[#0F1020]"
                    )}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Personal Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all",
                      activeTab === "security"
                        ? "bg-white text-[#0F1020] shadow-sm"
                        : "text-[#7B7B9D] hover:text-[#0F1020]"
                    )}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Security &amp; Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────── */}
          {/* TAB 1: PERSONAL DETAILS & AVATAR                   */}
          {/* ─────────────────────────────────────────────────── */}
          {activeTab === "details" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column (2 spans): Edit Details & Avatar */}
              <div className="lg:col-span-2 space-y-6">
                <Panel>
                  <PanelHeader
                    title="Account Details"
                    subtitle="Customize your name, contact phone number, and work email."
                  />
                  <div className="p-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Full Name *</FieldLabel>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sarath Gunawardena"
                        />
                      </div>

                      <div>
                        <FieldLabel>System Username</FieldLabel>
                        <Input
                          value={originalData?.username || sessionUser?.username || ""}
                          disabled
                          className="bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
                        />
                        <span className="mt-1 block text-[10px] text-slate-400">
                          Username is locked to your institutional identity.
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Work Email Address</FieldLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="user@waypoint.lk"
                        />
                      </div>

                      <div>
                        <FieldLabel>Mobile Phone Number</FieldLabel>
                        <Input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="071 445 5661"
                        />
                        <span className="mt-1 block text-[10px] text-slate-400">
                          Used for dispatch updates and urgent system alerts.
                        </span>
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Avatar Visual Theme */}
                <Panel>
                  <PanelHeader
                    title="Avatar & Visual Identity"
                    subtitle="Select a branded color theme preset or provide a custom image URL."
                  />
                  <div className="p-6 space-y-5">
                    <div>
                      <FieldLabel>Select Color Theme Preset</FieldLabel>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setAvatarPreset(preset.id);
                              setCustomAvatarActive(false);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                              !customAvatarActive && avatarPreset === preset.id
                                ? "border-[#F5C542] bg-[#F5C542]/10 shadow-sm"
                                : "border-black/[0.07] hover:border-black/20 bg-white"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-sm",
                                preset.bg,
                                preset.text
                              )}
                            >
                              {userInitials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#0F1020] truncate">
                                {preset.label}
                              </div>
                              <div className="text-[10px] text-slate-500">Theme preset</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#E7EAF0] pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel className="mb-0">Or Custom Image URL</FieldLabel>
                        <button
                          type="button"
                          onClick={() => setCustomAvatarActive(!customAvatarActive)}
                          className="text-[11px] font-bold text-indigo-600 hover:underline"
                        >
                          {customAvatarActive ? "Use Color Preset Instead" : "Enable Image URL"}
                        </button>
                      </div>
                      {customAvatarActive && (
                        <div className="space-y-2">
                          <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... or avatar image URL"
                          />
                          <p className="text-[10px] text-slate-400">
                            Square images (1:1 ratio) work best. The image will render in your header avatar ring.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
              </div>

              {/* Right Column: Institutional Scope & Details */}
              <div className="space-y-6">
                <Panel>
                  <PanelHeader
                    title="Operational Scope"
                    subtitle="Institutional permissions & assignment."
                  />
                  <div className="p-5 space-y-4">
                    <div className="rounded-xl border border-black/[0.07] bg-slate-50/70 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Operational Role
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#0F1020]">{roleFormatted}</span>
                        <RoleHeaderBadge>{originalData?.role || currentRole}</RoleHeaderBadge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-black/[0.07] bg-slate-50/70 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Assigned Operating Center
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#F5C542]" />
                        <span className="text-xs font-bold text-[#0F1020]">{locationLabel}</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-black/[0.07] bg-slate-50/70 p-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Account System Identifier
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-600">
                        {originalData?.id || sessionUser?.id || "usr-000"}
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-900">
                      <strong>Policy Note:</strong> Operational roles and depot re-assignments are managed by the Waypoint Operations Command. Contact IT Dispatch Admin to alter role authority.
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <PanelHeader title="Account Status" />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email Verification</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <Check className="h-3 w-3" /> Verified
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Auth Method</span>
                      <span className="font-semibold text-slate-700">Better Auth Credentials</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Session Status</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* TAB 2: SECURITY & PASSWORD                         */}
          {/* ─────────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel>
                <PanelHeader
                  title="Update Password"
                  subtitle="Change your institutional login password."
                />
                <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                  {passwordMessage && (
                    <div
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg p-3 text-xs font-semibold",
                        passwordMessage.type === "success"
                          ? "bg-[#ECFDF5] text-[#047857] border border-[#10B981]/20"
                          : "bg-[#FEF2F2] text-[#DC2626] border border-[#EF4444]/20"
                      )}
                    >
                      {passwordMessage.type === "success" ? (
                        <Check className="h-4 w-4 shrink-0 text-[#10B981]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-[#EF4444]" />
                      )}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <div>
                    <FieldLabel>Current Password *</FieldLabel>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>New Password * (Min 8 characters)</FieldLabel>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new secure password"
                    />
                  </div>

                  <div>
                    <FieldLabel>Confirm New Password *</FieldLabel>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={passwordLoading}
                      className="w-full font-bold text-xs"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Update Password</span>
                    </Button>
                  </div>
                </form>
              </Panel>

              <Panel>
                <PanelHeader
                  title="Session Security Policy"
                  subtitle="Enterprise security parameters managed by Waypoint Better Auth."
                />
                <div className="p-6 space-y-4">
                  <div className="rounded-xl border border-black/[0.07] bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Session Token Validity</span>
                      <span className="font-bold text-[#0F1020]">7 Days (Rolling Refresh)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Cookie Security</span>
                      <span className="font-mono text-slate-700">HttpOnly · SameSite=Lax</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Password Encryption</span>
                      <span className="font-bold text-emerald-600">Cryptographic Scrypt Hash</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-indigo-600" />
                      Institutional Security Policy
                    </div>
                    <p className="text-[11px] leading-relaxed text-indigo-800">
                      All account profile changes and password updates are logged to the audit log. If you suspect unauthorized access or require credential revocation, contact the Waypoint Security Tower immediately.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="mt-8 flex items-center justify-between rounded-xl border border-black/[0.07] bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Personalized customizations apply immediately across your dashboard session.
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                className="text-xs font-semibold"
              >
                Discard
              </Button>
              <Button
                type="button"
                variant="primary"
                isLoading={isSaving}
                onClick={() => handleSaveProfile()}
                className="text-xs font-bold"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save All Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
