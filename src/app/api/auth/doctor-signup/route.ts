import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { DoctorSignupSchema } from "@/lib/validations/auth.schema";

// Doctor registration — creates a login User (role=doctor) plus a linked catalog
// Doctor profile. Does NOT auto-login (the UI shows a "pending review" screen).
export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = DoctorSignupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const name = `Dr. ${data.firstName.trim()} ${data.lastName.trim()}`;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "doctor",
      phone: data.phone,
      doctorProfile: {
        create: {
          name,
          specialty: data.specialty,
          licenseNumber: data.medicalLicense,
          experience: data.experience,
          phone: data.phone,
          status: "Available today",
          bio: data.hospitalAffiliation || null,
        },
      },
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
