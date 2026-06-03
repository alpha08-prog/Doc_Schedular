import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";

const PLACEHOLDER_IMAGE = "/images/doctor-placeholder.jpg";

const EDITABLE_FIELDS = [
  "name",
  "specialty",
  "bio",
  "about",
  "time",
  "status",
  "experience",
  "phone",
  "licenseNumber",
] as const;

// Public: single doctor profile (used by the doctor detail page).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
  if (!doctor) {
    return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: { ...doctor, image: doctor.image || PLACEHOLDER_IMAGE },
  });
}

// Doctor self-service profile update.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.doctorProfileId !== params.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (typeof body[key] === "string") data[key] = body[key];
  }
  if (typeof body.fee === "number") data.fee = body.fee;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.doctor.update({ where: { id: params.id }, data });
  return NextResponse.json({
    success: true,
    data: { ...updated, image: updated.image || PLACEHOLDER_IMAGE },
  });
}
