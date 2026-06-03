import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { CreateDiagnosisSchema } from "@/lib/validations/diagnosis.schema";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const where: Prisma.DiagnosisWhereInput = {};
    if (session.role === "doctor") {
      where.doctorId = session.doctorProfileId ?? "__no_doctor__";
      const patientId = searchParams.get("patientId");
      if (patientId) where.patientId = patientId;
    } else {
      where.patientId = session.sub;
    }

    const data = await prisma.diagnosis.findMany({ where, orderBy: { date: "desc" } });
    return NextResponse.json({ success: true, data, total: data.length });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch diagnoses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "doctor") {
      return NextResponse.json(
        { success: false, error: "Only doctors can record diagnoses" },
        { status: session ? 403 : 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = CreateDiagnosisSchema.safeParse({ ...body, doctorId: session.doctorProfileId });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    if (Number.isNaN(Date.parse(parsed.data.date))) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 });
    }

    const patient = await prisma.user.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient || patient.role !== "patient") {
      return NextResponse.json(
        { success: false, error: "Selected patient not found" },
        { status: 400 }
      );
    }

    const created = await prisma.diagnosis.create({
      data: {
        patientId: parsed.data.patientId,
        doctorId: session.doctorProfileId!,
        appointmentId: parsed.data.appointmentId ?? null,
        diagnosis: parsed.data.diagnosis,
        notes: parsed.data.notes ?? null,
        date: new Date(parsed.data.date),
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create diagnosis" },
      { status: 500 }
    );
  }
}
