import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";

// Doctor-only: basic profile for a patient (used by the patient-history view).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const patient = await prisma.user.findUnique({ where: { id: params.id } });
  if (!patient || patient.role !== "patient") {
    return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      bloodType: patient.bloodType,
      conditions: patient.conditions,
    },
  });
}
