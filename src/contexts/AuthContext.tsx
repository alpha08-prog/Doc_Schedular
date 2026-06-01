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

  // Restore session on mount (handles page refreshes)
  useEffect(() => {
    const sessionUser = readSessionCookie();
    if (sessionUser) setUser(sessionUser);
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
        throw new Error(body.error ?? "Login failed. Please try again.");
      }

      const data = (await res.json()) as { user?: Partial<User> };

      // The server set the session cookie via Set-Cookie header.
      // Build user state directly from the API response.
      const loggedInUser: User = {
        id: String(data.user?.id ?? (role === "doctor" ? "doctor-1" : "patient-1")),
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
    const expire = "; path=/; max-age=0; samesite=lax";
    document.cookie = "session=" + expire;
    document.cookie = "auth=" + expire;
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
