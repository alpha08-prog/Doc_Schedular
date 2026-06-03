import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { CreatePrescriptionSchema } from "@/lib/validations/prescription.schema";

// GET - prescriptions for the current user (doctor → theirs; patient → theirs)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const where: Prisma.PrescriptionWhereInput = {};

    if (session.role === "doctor") {
      where.doctorId = session.doctorProfileId ?? "__no_doctor__";
      const patientId = searchParams.get("patientId");
      if (patientId) where.patientId = patientId;
    } else {
      where.patientId = session.sub;
    }

    const appointmentId = searchParams.get("appointmentId");
    if (appointmentId) where.appointmentId = appointmentId;

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { medicineName: { contains: search, mode: "insensitive" } },
        { patientName: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.prescription.findMany({ where, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data, total: data.length });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

// POST - a doctor creates a prescription for one of their patients
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json(
        { success: false, error: "Only doctors can create prescriptions" },
        { status: session ? 403 : 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = CreatePrescriptionSchema.safeParse({
      ...body,
      doctorId: session.doctorProfileId,
      prescriptionDate: body.prescriptionDate || new Date().toISOString().split("T")[0],
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const patient = await prisma.user.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient || patient.role !== "patient") {
      return NextResponse.json(
        { success: false, error: "Selected patient not found" },
        { status: 400 }
      );
    }

    const created = await prisma.prescription.create({
      data: {
        patientId: parsed.data.patientId,
        patientName: parsed.data.patientName,
        doctorId: session.doctorProfileId!,
        appointmentId: parsed.data.appointmentId ?? null,
        medicineName: parsed.data.medicineName,
        dosage: parsed.data.dosage,
        duration: parsed.data.duration,
        notes: parsed.data.notes ?? "",
        prescriptionDate: parsed.data.prescriptionDate,
      },
    });

    return NextResponse.json(
      { success: true, data: created, message: "Prescription created successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}
