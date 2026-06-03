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
  register: (role: UserRole, payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function redirectFor(role: UserRole): string {
  // Patients land on the doctor browse page (a clearly logged-in view); "/" is
  // the public landing page that still shows Login/Sign Up.
  return role === "doctor" ? "/doctor/dashboard" : "/doctors";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate the session on mount. The session cookie is httpOnly, so it cannot
  // be read from JS — we ask the server who we are.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (active && res.ok) {
          const data = (await res.json()) as { user?: User };
          if (data.user) setUser(data.user);
        }
      } catch {
        // Not authenticated — ignore.
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      const endpoint = role === "doctor" ? "/api/auth/doctor-login" : "/api/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        user?: User;
        error?: string;
      };
      if (!res.ok || !data.success || !data.user) {
        throw new Error(data.error ?? "Login failed. Please try again.");
      }
      setUser(data.user);
      router.push(redirectFor(role));
      router.refresh();
    },
    [router]
  );

  const register = useCallback(
    async (role: UserRole, payload: Record<string, unknown>) => {
      const endpoint = role === "doctor" ? "/api/auth/doctor-signup" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        user?: User;
        error?: string;
      };
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Sign up failed. Please try again.");
      }
      // Patient signup auto-logs-in (returns a user + session); doctor signup
      // does not (it returns no user pending review).
      if (data.user) {
        setUser(data.user);
        router.push(redirectFor(role));
        router.refresh();
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best effort — clear local state regardless.
    }
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
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
