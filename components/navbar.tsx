"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  LogOut,
  Menu,
  MessageCircle,
  ShieldAlert,
  Compass,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { useOnboarding } from "@/lib/onboarding/onboarding-context";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@/components/ui/avatar-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Spatium-style floating pill navbar.
 * Completely rebuilt presentation — preserves Soul Discovery navigation logic.
 */
export function Navbar() {
  const { isAuthenticated, logout, user } = useSession();
  const { startTour, isActive: tourActive } = useOnboarding();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileImage = user?.profileImage;
  const showAvatar = Boolean(profileImage) && !avatarBroken;

  useEffect(() => {
    setAvatarBroken(false);
  }, [profileImage]);

  const requestLogout = () => {
    setShowNotifs(false);
    setShowProfileMenu(false);
    setMobileOpen(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setLogoutConfirmOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/assessments", label: "Assessments" },
  ];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setShowProfileMenu(false);
    setShowNotifs(false);
  }, [pathname]);

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
          const uid = localStorage.getItem("aurapulse_wellness_active_user");
          const planRaw =
            localStorage.getItem(
              uid
                ? `aurapulse_wellness_plan_v1:${uid}`
                : "aurapulse_wellness_plan_v1"
            ) || localStorage.getItem("aurapulse_wellness_plan_v1");
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
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1120px] justify-center px-4 pt-3 md:pt-4">
        {/*
          Desktop / large tablet floating pill
          Structure: [Logo] [Nav links] [Actions: Dashboard | Bell | Logout]
          Shows from lg (1024px+) so mid widths use the mobile menu instead of overlapping.
        */}
        <nav
          className="nav-pill hidden w-full max-w-[1080px] lg:flex"
          aria-label="Primary"
        >
          {/* Logo — icon on lg, full mark from xl to avoid crowding */}
          <Link
            href="/"
            className="mr-1 flex shrink-0 items-center xl:mr-2"
            aria-label={BRAND_NAME}
          >
            <BrandLogo variant="icon" size={36} className="xl:hidden" />
            <BrandLogo variant="mark" size={34} className="hidden xl:inline-flex" />
          </Link>

          {/* Navigation — compact center links */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1 xl:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.href === "/assessments" ? "assessments" : undefined}
                data-tour-priority={item.href === "/assessments" ? "low" : undefined}
                data-active={
                  item.href === "/assessments"
                    ? pathname?.startsWith("/assessments")
                    : pathname === item.href
                }
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  href="/wellness-plan"
                  data-tour="wellness-plan"
                  data-tour-priority="low"
                  data-active={pathname?.startsWith("/wellness-plan")}
                  className="nav-link"
                >
                  Wellness Plans
                </Link>
                <Link
                  href="/progress"
                  data-active={pathname?.startsWith("/progress")}
                  className="nav-link"
                >
                  Progress
                </Link>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 xl:gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  data-tour="dashboard"
                  data-tour-priority="low"
                  className="nav-dashboard-btn"
                >
                  Dashboard
                </Link>

                <div className="relative shrink-0" ref={profileMenuRef}>
                  <button
                    type="button"
                    aria-label="Profile menu"
                    aria-expanded={showProfileMenu}
                    aria-haspopup="menu"
                    onClick={() => {
                      setShowNotifs(false);
                      setShowProfileMenu((v) => !v);
                    }}
                    className={cn(
                      "flex h-9 items-center gap-1 rounded-full border border-[#EADCE5] bg-[#FFF0F6] pl-0.5 pr-1.5 text-[#795A70] transition hover:border-[#E5B8D4] hover:bg-[#FFF0F6]",
                      (pathname === "/profile" ||
                        pathname?.startsWith("/settings/emergency")) &&
                        "border-[#BE4A8B]/40 ring-1 ring-[#BE4A8B]/20"
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
                      {showAvatar ? (
                        <AvatarImage
                          src={profileImage!}
                          alt={user?.name ? `${user.name}'s profile` : "Profile"}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                          onError={() => setAvatarBroken(true)}
                        />
                      ) : (
                        <User className="h-4 w-4" aria-hidden />
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 opacity-70 transition",
                        showProfileMenu && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-[18px] border border-[#EADCE5] bg-white py-1.5 shadow-[0_8px_28px_rgba(123,57,98,0.1)]"
                      >
                        <Link
                          role="menuitem"
                          href="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-[#49263D] transition hover:bg-[#FFF0F6]",
                            pathname === "/profile" && "bg-[#FFF0F6] text-[#B74783]"
                          )}
                        >
                          <User className="h-4 w-4 text-[#B74783]" />
                          Profile
                        </Link>
                        <Link
                          role="menuitem"
                          href="/settings/emergency"
                          onClick={() => setShowProfileMenu(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-[#49263D] transition hover:bg-[#FFF0F6]",
                            pathname?.startsWith("/settings/emergency") &&
                              "bg-[#FFF0F6] text-[#B74783]"
                          )}
                        >
                          <ShieldAlert className="h-4 w-4 text-[#B74783]" />
                          Emergency
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={tourActive}
                          onClick={() => {
                            setShowProfileMenu(false);
                            startTour();
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-[#49263D] transition hover:bg-[#FFF0F6] disabled:opacity-50"
                        >
                          <Compass className="h-4 w-4 text-[#B74783]" />
                          Take a Website Tour
                        </button>
                        <div className="my-1 border-t border-[#EADCE5]" />
                        <button
                          type="button"
                          role="menuitem"
                          onClick={requestLogout}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D]"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative shrink-0" ref={notifRef}>
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowNotifs((v) => !v);
                    }}
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D]"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#B74783]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[20px] border border-[#EADCE5] bg-white shadow-[0_8px_28px_rgba(123,57,98,0.08)] backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between border-b border-[#EADCE5] px-4 py-3">
                          <span className="text-sm font-semibold text-[#49263D]">
                            Notifications
                          </span>
                          {notifications.length > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs font-semibold text-[#795A70] hover:text-[#49263D]"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-[#927C8B]">
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
                                  className="flex gap-3 border-b border-[#EADCE5] px-4 py-3 transition hover:bg-white"
                                >
                                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#B74783]" />
                                  <div>
                                    <p className="text-sm font-semibold text-[#49263D]">
                                      {notif.title}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-[#927C8B]">
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
              <>
                <Link
                  href="/dashboard"
                  data-tour="dashboard"
                  data-tour-priority="low"
                  className="nav-dashboard-btn !h-9 !px-3 !text-[13px]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  aria-label="Profile"
                  data-active={pathname === "/profile"}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#EADCE5] bg-[#FFF0F6] text-[#795A70] transition hover:border-[#E5B8D4]",
                    pathname === "/profile" && "border-[#BE4A8B]/40 ring-1 ring-[#BE4A8B]/20"
                  )}
                >
                  {showAvatar ? (
                    <AvatarImage
                      src={profileImage!}
                      alt={user?.name ? `${user.name}'s profile` : "Profile"}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarBroken(true)}
                    />
                  ) : (
                    <User className="h-4 w-4" aria-hidden />
                  )}
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn-spatium !px-3 !py-2 text-[13px]">
                Sign In
              </Link>
            )}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#49263D]"
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
            className="pointer-events-auto mx-4 mt-3 overflow-hidden rounded-[24px] border border-[#EADCE5] bg-white p-3 shadow-[0_8px_28px_rgba(123,57,98,0.08)] backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.href === "/assessments" ? "assessments" : undefined}
                  data-tour-priority={item.href === "/assessments" ? "low" : undefined}
                  onClick={closeMobile}
                  className={cn(
                    "rounded-xl px-4 py-3 text-[15px] font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D]",
                    pathname === item.href && "bg-white/5 text-[#49263D]"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    data-tour="dashboard"
                    data-tour-priority="low"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[#795A70] transition hover:bg-[#FFF0F6] hover:text-[#49263D]",
                      pathname === "/dashboard" && "bg-white/5 text-[#49263D]"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/wellness-plan"
                    data-tour="wellness-plan"
                    data-tour-priority="low"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[#795A70] hover:bg-[#FFF0F6] hover:text-[#49263D]",
                      pathname?.startsWith("/wellness-plan") &&
                        "bg-white/5 text-[#49263D]"
                    )}
                  >
                    Wellness Plans
                  </Link>
                  <Link
                    href="/progress"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[#795A70] hover:bg-[#FFF0F6] hover:text-[#49263D]",
                      pathname?.startsWith("/progress") &&
                        "bg-white/5 text-[#49263D]"
                    )}
                  >
                    Progress
                  </Link>
                  <div className="my-1 border-t border-[#EADCE5]" />
                  <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#927C8B]">
                    Profile
                  </p>
                  <Link
                    href="/profile"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[#795A70] hover:bg-[#FFF0F6] hover:text-[#49263D]",
                      pathname === "/profile" && "bg-white/5 text-[#49263D]"
                    )}
                  >
                    Profile settings
                  </Link>
                  <Link
                    href="/settings/emergency"
                    onClick={closeMobile}
                    className={cn(
                      "rounded-xl px-4 py-3 text-[15px] font-semibold text-[#795A70] hover:bg-[#FFF0F6] hover:text-[#49263D]",
                      pathname?.startsWith("/settings/emergency") &&
                        "bg-white/5 text-[#49263D]"
                    )}
                  >
                    Emergency
                  </Link>
                  <button
                    type="button"
                    disabled={tourActive}
                    onClick={() => {
                      closeMobile();
                      startTour();
                    }}
                    className="rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-[#795A70] hover:bg-[#FFF0F6] hover:text-[#49263D] disabled:opacity-50"
                  >
                    Take a Website Tour
                  </button>
                  <button
                    type="button"
                    onClick={requestLogout}
                    className="rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-[#795A70] hover:bg-[#FFF0F6] hover:text-[#49263D]"
                  >
                    Sign out
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="max-w-[400px] sm:rounded-[22px]">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your Soul Discovery account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmLogout}
              disabled={isLoggingOut}
              className="bg-[#B74783] text-white hover:bg-[#9E3A70]"
            >
              {isLoggingOut ? "Signing out…" : "Yes, sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

/** @deprecated Use Navbar — kept as alias for existing imports */
export { Navbar as Header };
