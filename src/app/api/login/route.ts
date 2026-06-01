import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Mock auth — any credentials accepted for demo
  const user = {
    id: "patient-1",
    name: email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    role: "patient" as const,
  };

  const sessionPayload = Buffer.from(JSON.stringify(user)).toString("base64");

  const response = NextResponse.json({ success: true, user });

  // Structured session cookie (readable client-side for AuthContext)
  response.cookies.set("session", sessionPayload, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  // Legacy auth cookie for middleware compat during transition
  response.cookies.set("auth", "true", {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  return response;
}
