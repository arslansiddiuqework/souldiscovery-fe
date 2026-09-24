"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock,
  LogOut,
  Menu,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";

/**
 * Spatium-style floating pill navbar.
 * Completely rebuilt presentation — preserves Soul Discovery navigation logic.
 */
export function Navbar() {
  const { isAuthenticated, logout, user } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/features", label: "Features" },
  ];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const statusRes = await fetch("/api/emergency/status", { headers });
        const statusData = statusRes.ok ? await statusRes.json() : null;
        const moodRes = await fetch("/api/mood/history?limit=1", { headers });
        const moodData = moodRes.ok ? await moodRes.json() : null;
        if (!active) return;

        const compiled: any[] = [];

        if (statusData?.onCooldown) {
          compiled.push({
            id: "cooldown",
            title: "Recovery Cooldown Active",
            message: `Your clinical cooldown is active until ${new Date(
              statusData.cooldownExpiresAt
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
            type: "SAFETY",
            actionUrl: "/dashboard",
          });
        }

        if (statusData && statusData.contactCount === 0) {
          compiled.push({
            id: "no-contacts",
            title: "Configure Safety Plan",
            message: "Add at least one emergency contact to your settings.",
            type: "EXERCISE",
            actionUrl: "/settings/emergency",
          });
        }

        let loggedToday = false;
        if (moodData?.length > 0) {
          const last = new Date(
            moodData[0].timestamp || moodData[0].createdAt
          ).toDateString();
          loggedToday = last === new Date().toDateString();
        }

        if (!loggedToday) {
          compiled.push({
            id: "mood-nudge",
            title: "Daily Mood Nudge",
            message: "You haven't checked in with your mood today.",
            type: "MOOD_CHECK",
            actionUrl: "/dashboard?action=mood",
          });
        }

        compiled.push({
          id: "wellness-grounding",
          title: "Mindful Grounding",
          message: "Try a quick grounding activity to ease your mind.",
          type: "COOLDOWN",
          actionUrl: "/dashboard?action=breathing",
        });

        try {
          const planRaw = localStorage.getItem("aurapulse_wellness_plan_v1");
          const hasPlan = planRaw && JSON.parse(planRaw)?.plan?.weeks?.length;
          if (!hasPlan) {
            compiled.push({
              id: "wellness-plan-cta",
              title: "Create Your Wellness Plan",
              message:
                "Answer a few questions and get a personalized daily wellness journey.",
              type: "EXERCISE",
              actionUrl: "/wellness-plan",
            });
          }
        } catch {
          /* ignore */
        }

        const dismissedRaw = localStorage.getItem(
          "patient_dismissed_notifications"
        );
        const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
        const visible = compiled.filter((n) => !dismissed.includes(n.id));
        setNotifications(visible);
        setUnreadCount(visible.length);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    load();
    const interval = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const dismiss = (id: string) => {
    const raw = localStorage.getItem("patient_dismissed_notifications");
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem("patient_dismissed_notifications", JSON.stringify(ids));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = () => {
    const raw = localStorage.getItem("patient_dismissed_notifications");
    const ids: string[] = raw ? JSON.parse(raw) : [];
    notifications.forEach((n) => {
      if (!ids.includes(n.id)) ids.push(n.id);
    });
    localStorage.setItem("patient_dismissed_notifications", JSON.stringify(ids));
    setNotifications([]);
    setUnreadCount(0);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header ref={rootRef} className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1120px] justify-center px-4 pt-5 md:pt-6">
        {/*
          Desktop / large tablet floating pill
          Structure: [Logo] [Nav links] [Actions: Dashboard | Bell | Logout]
          Shows from lg (1024px+) so mid widths use the mobile menu instead of overlapping.
        */}
        <nav
          className="nav-pill hidden w-full max-w-[1080px] lg:flex"
          aria-label="Primary"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label={BRAND_NAME}
          >
            <BrandLogo variant="mark" size={36} />
          </Link>

          {/* Navigation — text links only; each item owns its space */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-5 xl:gap-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={pathname === item.href}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  href="/wellness-plan"
                  data-active={pathname?.startsWith("/wellness-plan")}
                  className="nav-link"
                >
                  Wellness Plan
                </Link>
                <Link
                  href="/profile"
                  data-active={pathname === "/profile"}
                  className="nav-link"
                >
                  Profile
                </Link>
                <Link
                  href="/settings/emergency"
                  data-active={pathname?.startsWith("/settings/emergency")}
                  className="nav-link"
                >
                  Emergency
                </Link>
              </>
            )}
          </div>

          {/* Actions — Dashboard and Notification are siblings with explicit gap */}
          <div className="flex shrink-0 items-center gap-2.5 xl:gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="nav-dashboard-btn">
                  Dashboard
                </Link>

                <div className="relative shrink-0" ref={notifRef}>
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setShowNotifs((v) => !v)}
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[rgba(231,218,237,0.82)] transition hover:bg-white/5 hover:text-[#f3eefa]"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#b384c9]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[20px] border border-[rgba(216,191,227,0.22)] bg-[rgba(16,11,32,0.95)] shadow-[0_20px_60px_rgba(6,3,16,0.55)] backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                          <span className="text-sm font-semibold text-[#f3eefa]">
                            Notifications
                          </span>
                          {notifications.length > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs font-semibold text-[rgba(231,218,237,0.7)] hover:text-[#f3eefa]"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-[rgba(231,218,237,0.5)]">
                              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 opacity-40" />
                              All caught up
                            </div>
                          ) : (
                            notifications.map((notif) => {
                              let Icon = Sparkles;
                              if (notif.type === "SAFETY") Icon = ShieldAlert;
                              else if (notif.type === "MOOD_CHECK")
                                Icon = MessageCircle;
                              else if (notif.type === "COOLDOWN") Icon = Clock;
                              else if (notif.type === "EXERCISE") Icon = User;
                              return (
                                <Link
                                  key={notif.id}
                                  href={notif.actionUrl}
                                  onClick={() => {
                                    setShowNotifs(false);
                                    dismiss(notif.id);
                                  }}
                                  className="flex gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/[0.04]"
                                >
                                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#b384c9]" />
                                  <div>
                                    <p className="text-sm font-semibold text-[#f3eefa]">
                                      {notif.title}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-[rgba(231,218,237,0.55)]">
                                      {notif.message}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[rgba(231,218,237,0.7)] transition hover:bg-white/5 hover:text-[#f3eefa]"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-spatium !px-4 !py-2.5 text-[14px]">
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile / tablet compact pill (< lg) */}
        <nav
          className="nav-pill flex w-full max-w-md items-center justify-between lg:hidden"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="flex min-w-0 items-center"
            onClick={closeMobile}
            aria-label={BRAND_NAME}
          >
            <BrandLogo variant="icon" size={34} className="sm:hidden" />
            <BrandLogo variant="mark" size={34} className="hidden sm:inline-flex" />
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            {isAuthenticated ? (
              <Link href="/dashboard" className="nav-dashboard-btn !h-9 !px-3 !text-[13px]">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="btn-spatium !px-3 !py-2 text-[13px]">
                Sign In
              </Link>
            )}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f3eefa]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto mx-4 mt-3 overflow-hidden rounded-[24px] border border-[rgba(216,191,227,0.22)] bg-[rgba(16,11,32,0.92)] p-3 shadow-[0_20px_60px_rgba(6,3,16,0.55)] backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    "rounded-xl px-4 py-3 text-[15px] font-semibold text-[rgba(231,218,237,0.82)] transition hover:bg-white/5 hover:text-[#f3eefa]",
                    pathname === item.href && "bg-white/5 text-[#f3eefa]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[rgba(231,218,237,0.82)] transition hover:bg-white/5 hover:text-[#f3eefa]",
                      pathname === "/dashboard" && "bg-white/5 text-[#f3eefa]"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/wellness-plan"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[rgba(231,218,237,0.82)] hover:bg-white/5 hover:text-[#f3eefa]",
                      pathname?.startsWith("/wellness-plan") &&
                        "bg-white/5 text-[#f3eefa]"
                    )}
                  >
                    Wellness Plan
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[rgba(231,218,237,0.82)] hover:bg-white/5 hover:text-[#f3eefa]",
                      pathname === "/profile" && "bg-white/5 text-[#f3eefa]"
                    )}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings/emergency"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[rgba(231,218,237,0.82)] hover:bg-white/5 hover:text-[#f3eefa]",
                      pathname?.startsWith("/settings/emergency") &&
                        "bg-white/5 text-[#f3eefa]"
                    )}
                  >
                    Emergency
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-[rgba(231,218,237,0.82)] hover:bg-white/5 hover:text-[#f3eefa]"
                  >
                    Sign out
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** @deprecated Use Navbar — kept as alias for existing imports */
export { Navbar as Header };
