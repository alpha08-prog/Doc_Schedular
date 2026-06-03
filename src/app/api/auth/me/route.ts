import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";

// Returns the currently authenticated user (the AuthContext hydrates from this
// on mount, since the session cookie is httpOnly and unreadable by JS).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { doctorProfile: true },
  });
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const base = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const safeUser =
    user.role === "doctor"
      ? {
          ...base,
          specialty: user.doctorProfile?.specialty ?? undefined,
          doctorProfileId: user.doctorProfile?.id ?? undefined,
          experience: user.doctorProfile?.experience ?? undefined,
          fee: user.doctorProfile?.fee ?? undefined,
        }
      : {
          ...base,
          phone: user.phone ?? undefined,
          age: user.age ?? undefined,
          bloodType: user.bloodType ?? undefined,
          conditions: user.conditions,
        };

  return NextResponse.json({ success: true, user: safeUser });
}
