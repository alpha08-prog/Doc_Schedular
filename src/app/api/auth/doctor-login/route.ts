import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Mock authentication — accepts any credentials for demo
  const user = {
    id: "doctor-1",
    name: "Dr. Smith",
    email,
    role: "doctor" as const,
  };

  const response = NextResponse.json({ success: true, user });

  // Set auth cookie so middleware protects doctor routes
  response.cookies.set("auth", "true", {
    httpOnly: false, // readable by client for AuthContext
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  return response;
}
