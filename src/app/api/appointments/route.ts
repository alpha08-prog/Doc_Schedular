import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { CreateAppointmentSchema } from "@/lib/validations/appointment.schema";

type AppointmentWithRels = Prisma.AppointmentGetPayload<{
  include: { patient: true; doctor: true };
}>;

// Flatten to the legacy Appointment shape, enriched with patient/doctor names.
function serialize(a: AppointmentWithRels) {
  return {
    id: a.id,
    patientId: a.patientId,
    doctorId: a.doctorId,
    date: a.date,
    reason: a.reason,
    notes: a.notes,
    status: a.status,
    type: a.type,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    patientName: a.patient?.name ?? null,
    doctorName: a.doctor?.name ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const where: Prisma.AppointmentWhereInput = {};

    if (session.role === "doctor") {
      // A doctor only ever sees their own appointments; an optional patientId
      // narrows to one patient (used by the patient-history view).
      where.doctorId = session.doctorProfileId ?? "__no_doctor__";
      const patientId = searchParams.get("patientId");
      if (patientId) where.patientId = patientId;
    } else {
      // A patient only ever sees their own appointments.
      where.patientId = session.sub;
    }

    const rows = await prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true },
      orderBy: { date: "desc" },
    });
    const data = rows.map(serialize);
    return NextResponse.json({ success: true, data, total: data.length });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "patient") {
      return NextResponse.json(
        { success: false, error: "Only patients can book appointments" },
        { status: session ? 403 : 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    // patientId always comes from the session, never the request body.
    const parsed = CreateAppointmentSchema.safeParse({ ...body, patientId: session.sub });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    if (Number.isNaN(Date.parse(parsed.data.date))) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: parsed.data.doctorId } });
    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 400 });
    }

    const created = await prisma.appointment.create({
      data: {
        patientId: session.sub,
        doctorId: parsed.data.doctorId,
        date: new Date(parsed.data.date),
        reason: parsed.data.reason,
        notes: parsed.data.notes ?? null,
        type: parsed.data.type ?? null,
        status: "pending",
      },
      include: { patient: true, doctor: true },
    });
    return NextResponse.json({ success: true, data: serialize(created) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
