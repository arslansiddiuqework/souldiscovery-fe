"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  aiName?: string;
  aiBehavior?: string;
  aiAvatar?: string;
  aiVoice?: string;
  websiteTourCompleted?: boolean;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  patchUser: (partial: Partial<User>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        const { password, ...safeUserData } = userData;
        setUser(safeUserData);
        try {
          const { setWellnessStorageUserId } = await import(
            "@/lib/wellness-plan/storage"
          );
          setWellnessStorageUserId(safeUserData._id || null);
        } catch {
          /* wellness storage optional at boot */
        }
      } else if (response.status === 401 || response.status === 403) {
        // Only clear on auth rejection — keep token on 5xx / proxy blips
        setUser(null);
        localStorage.removeItem("token");
        try {
          const { setWellnessStorageUserId } = await import(
            "@/lib/wellness-plan/storage"
          );
          setWellnessStorageUserId(null);
        } catch {
          /* ignore */
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("SessionContext: Error checking session:", error);
      setUser(null);
      // Keep token on network/abort so a flaky backend does not force logout
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      try {
        const { setWellnessStorageUserId } = await import(
          "@/lib/wellness-plan/storage"
        );
        setWellnessStorageUserId(null);
      } catch {
        /* ignore */
      }
      router.push("/");
    }
  };

  const patchUser = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        checkSession,
        patchUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
