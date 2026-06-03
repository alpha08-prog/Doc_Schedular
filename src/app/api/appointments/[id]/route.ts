import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/getCurrentUser";
import { UpdateAppointmentSchema } from "@/lib/validations/appointment.schema";
import type { SessionPayload } from "@/lib/auth/session";

type AppointmentWithRels = Prisma.AppointmentGetPayload<{
  include: { patient: true; doctor: true };
}>;

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

function owns(session: SessionPayload, appt: AppointmentWithRels): boolean {
  return session.role === "doctor"
    ? appt.doctorId === session.doctorProfileId
    : appt.patientId === session.sub;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { patient: true, doctor: true },
  });
  if (!appointment) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }
  if (!owns(session, appointment)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ success: true, data: serialize(appointment) });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const existing = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { patient: true, doctor: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }
    if (!owns(session, existing)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = UpdateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { status, notes, reason, date, type } = parsed.data;
    const data: Prisma.AppointmentUpdateInput = {};
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (reason !== undefined) data.reason = reason;
    if (type !== undefined) data.type = type;
    if (date !== undefined) data.date = new Date(date);

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data,
      include: { patient: true, doctor: true },
    });
    return NextResponse.json({ success: true, data: serialize(updated) });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const existing = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { patient: true, doctor: true },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }
  if (!owns(session, existing)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  // Soft-cancel rather than hard-delete.
  await prisma.appointment.update({ where: { id: params.id }, data: { status: "cancelled" } });
  return NextResponse.json({ success: true, data: { id: params.id } });
}
