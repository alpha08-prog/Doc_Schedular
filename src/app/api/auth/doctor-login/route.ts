import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";
import { CredentialsSchema } from "@/lib/validations/auth.schema";

// Doctor login.
export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = CredentialsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { doctorProfile: true },
  });
  if (!user || user.role !== "doctor" || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const doctorProfileId = user.doctorProfile?.id;
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialty: user.doctorProfile?.specialty,
    doctorProfileId,
  };
  const token = await signSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: "doctor",
    doctorProfileId,
  });

  const response = NextResponse.json({ success: true, user: safeUser });
  setSessionCookie(response, token);
  return response;
}
