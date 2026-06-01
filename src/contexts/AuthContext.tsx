"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.trim() === "auth=true");
}

function readSessionCookie(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith("session="));
  if (!match) return null;
  try {
    const value = match.split("=").slice(1).join("=");
    return JSON.parse(atob(value)) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try structured session cookie first (Phase 5+), fall back to legacy auth cookie
    const sessionUser = readSessionCookie();
    if (sessionUser) {
      setUser(sessionUser);
    } else if (readAuthCookie()) {
      // Legacy mock auth — create a minimal patient user
      const saved =
        typeof localStorage !== "undefined" ? localStorage.getItem("patientProfile") : null;
      const profile = saved ? (JSON.parse(saved) as Partial<User>) : {};
      setUser({
        id: profile.id ?? "patient-1",
        name: profile.name ?? "Patient",
        email: profile.email ?? "",
        role: "patient",
      } as User);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      const endpoint = role === "doctor" ? "/api/auth/doctor-login" : "/api/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Login failed");
      }

      // Legacy fallback: set auth cookie if the API doesn't set session cookie
      const data = (await res.json()) as { user?: Partial<User> };
      if (!readSessionCookie()) {
        document.cookie = "auth=true; path=/; max-age=86400; samesite=lax";
      }

      const loggedInUser: User = {
        id: data.user?.id ?? "1",
        name: data.user?.name ?? email.split("@")[0],
        email,
        role,
      } as User;

      setUser(loggedInUser);
      router.push(role === "doctor" ? "/doctor/dashboard" : "/");
    },
    [router]
  );

  const logout = useCallback(() => {
    // Clear all auth cookies
    document.cookie = "auth=; path=/; max-age=0";
    document.cookie = "session=; path=/; max-age=0";
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
