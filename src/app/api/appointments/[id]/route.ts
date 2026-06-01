import { NextRequest, NextResponse } from "next/server";
import { appointmentStore } from "../store";
import type { Appointment } from "../../../../types/appointment";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const appointment = appointmentStore.findById(params.id);
  if (!appointment) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: appointment });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Partial<Appointment>;
    const allowedKeys: Array<keyof Appointment> = ["status", "notes", "reason", "date", "type"];
    const patch: Partial<Appointment> = {};
    for (const key of allowedKeys) {
      if (key in body) (patch as Record<string, unknown>)[key] = body[key];
    }
    const updated = appointmentStore.update(params.id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const appointment = appointmentStore.findById(params.id);
  if (!appointment) {
    return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
  }
  appointmentStore.update(params.id, { status: "cancelled" });
  return NextResponse.json({ success: true, data: { id: params.id } });
}
