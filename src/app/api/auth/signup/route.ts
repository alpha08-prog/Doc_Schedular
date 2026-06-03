import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { SignupSchema } from "@/lib/validations/auth.schema";

// Patient registration — auto-logs the new patient in.
export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = SignupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { name, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: "patient" },
  });

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: "patient",
  });

  const response = NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  setSessionCookie(response, token);
  return response;
}
