import type { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./session";

// Cookie helpers for Node route handlers. Set the signed session JWT as an
// httpOnly cookie so it is never readable by client-side JavaScript.

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  // Clear the legacy plain auth cookie from before the JWT migration, if present.
  res.cookies.set("auth", "", { maxAge: 0, path: "/" });
}
