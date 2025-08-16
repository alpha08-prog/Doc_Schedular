import { NextRequest, NextResponse } from 'next/server';
import type { Appointment } from '../../../types/appointment';
import { appointmentStore } from './store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    let data = [...appointmentStore.all()];
    if (patientId) data = data.filter(a => a.patientId === patientId);
    if (doctorId) data = data.filter(a => a.doctorId === doctorId);

    // sort by date desc
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, data, total: data.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Basic validation
    const required = ['patientId', 'doctorId', 'date', 'reason'] as const;
    const missing = required.filter((k) => !body[k] || String(body[k]).trim() === '');
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }
    if (Number.isNaN(Date.parse(body.date))) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }
    const created = appointmentStore.create({
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      reason: body.reason,
      notes: body.notes || '',
    } as Omit<Appointment,'id'|'createdAt'|'updatedAt'>);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create appointment' }, { status: 500 });
  }
}
