import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { UpdatePrescriptionSchema } from "@/lib/validations/prescription.schema";

// GET - single prescription (owning doctor or patient)
export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const prescription = await prisma.prescription.findUnique({ where: { id: context.params.id } });
  if (!prescription) {
    return NextResponse.json({ success: false, error: "Prescription not found" }, { status: 404 });
  }
  const owns =
    session.role === "doctor"
      ? prescription.doctorId === session.doctorProfileId
      : prescription.patientId === session.sub;
  if (!owns) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ success: true, data: prescription });
}

// PUT - update (prescribing doctor only)
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const existing = await prisma.prescription.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Prescription not found" }, { status: 404 });
  }
  if (existing.doctorId !== session.doctorProfileId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = UpdatePrescriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { medicineName, dosage, duration, notes, prescriptionDate } = parsed.data;
  const data: Prisma.PrescriptionUpdateInput = {};
  if (medicineName !== undefined) data.medicineName = medicineName;
  if (dosage !== undefined) data.dosage = dosage;
  if (duration !== undefined) data.duration = duration;
  if (notes !== undefined) data.notes = notes;
  if (prescriptionDate !== undefined) data.prescriptionDate = prescriptionDate;

  const updated = await prisma.prescription.update({ where: { id: context.params.id }, data });
  return NextResponse.json({
    success: true,
    data: updated,
    message: "Prescription updated successfully",
  });
}

// DELETE - remove (prescribing doctor only)
export async function DELETE(_req: NextRequest, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "doctor") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const existing = await prisma.prescription.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Prescription not found" }, { status: 404 });
  }
  if (existing.doctorId !== session.doctorProfileId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.prescription.delete({ where: { id: context.params.id } });
  return NextResponse.json({
    success: true,
    data: existing,
    message: "Prescription deleted successfully",
  });
}
