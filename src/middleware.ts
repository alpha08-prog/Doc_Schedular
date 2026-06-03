import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

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

// Routes that require any authenticated user
const PATIENT_ROUTES = ["/booking", "/patient", "/records", "/profile"];

// Routes that are always public (no auth needed)
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/doctor/login", "/doctor/signup", "/doctors"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow API routes and static assets
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Always allow explicitly public routes (exact or prefix)
  if (PUBLIC_ROUTES.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")))) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // Doctor portal routes → require doctor role
  if (DOCTOR_PORTAL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (!session || session.role !== "doctor") {
      return NextResponse.redirect(new URL("/doctor/login", request.url));
    }
    return NextResponse.next();
  }

  // Patient routes → require any authenticated user
  if (PATIENT_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // /doctor/[id]/book and /doctor/[id]/success → require auth (patient booking)
  const doctorBookingMatch = pathname.match(/^\/doctor\/[^/]+\/(book|success)/);
  if (doctorBookingMatch) {
    if (!session) {
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
