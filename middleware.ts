import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor";
}

function getSessionUser(request: NextRequest): SessionUser | null {
  // Try structured session cookie first
  const sessionValue = request.cookies.get("session")?.value;
  if (sessionValue) {
    try {
      const decoded = atob(sessionValue); // atob is available in Edge runtime
      const user = JSON.parse(decoded) as SessionUser;
      if (user.role === "patient" || user.role === "doctor") return user;
    } catch {
      // Malformed — fall through to legacy check
    }
  }

  // Legacy fallback: plain auth=true cookie (set before Phase 5 upgrade)
  if (request.cookies.get("auth")?.value === "true") {
    // We don't know the role from the legacy cookie — treat as patient
    return { id: "patient-1", name: "User", email: "", role: "patient" };
  }

  return null;
}

// Routes that require role === 'doctor'
const DOCTOR_PORTAL_ROUTES = [
  "/doctor/dashboard",
  "/doctor/appointments",
  "/doctor/calendar",
  "/doctor/patients",
  "/doctor/prescriptions",
  "/doctor/reviews",
  "/doctor/profile",
  "/doctor/logout",
];

// Routes that require any authenticated user (patient role or any)
const PATIENT_ROUTES = ["/booking", "/patient", "/records", "/profile"];

// Routes that are always public (no auth needed)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/otp",
  "/doctor/login",
  "/doctor/signup",
  "/doctors",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow API routes and static assets
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Always allow explicitly public routes (exact or prefix)
  if (PUBLIC_ROUTES.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")))) {
    return NextResponse.next();
  }

  const user = getSessionUser(request);

  // Doctor portal routes → require doctor role
  if (DOCTOR_PORTAL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (!user || user.role !== "doctor") {
      return NextResponse.redirect(new URL("/doctor/login", request.url));
    }
    return NextResponse.next();
  }

  // Patient routes → require any authenticated user
  if (PATIENT_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // /doctor/[id]/book and /doctor/[id]/success → require patient auth
  const doctorBookingMatch = pathname.match(/^\/doctor\/[^/]+\/(book|success)/);
  if (doctorBookingMatch) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Everything else: allow (covers /doctor/[id] detail page, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|images/).*)"],
};
