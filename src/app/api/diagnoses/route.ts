import { NextRequest, NextResponse } from 'next/server';
import type { Diagnosis } from '../../../types/diagnosis';
import { diagnosisStore } from './store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    let data = [...diagnosisStore.all()];
    if (patientId) data = data.filter(d => d.patientId === patientId);
    if (doctorId) data = data.filter(d => d.doctorId === doctorId);

    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, data, total: data.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch diagnoses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Basic validation
    const required = ['patientId', 'doctorId', 'diagnosis', 'date'] as const;
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
    const created = diagnosisStore.create({
      patientId: body.patientId,
      doctorId: body.doctorId,
      appointmentId: body.appointmentId,
      diagnosis: body.diagnosis,
      notes: body.notes || '',
      date: body.date,
    } as Omit<Diagnosis,'id'|'createdAt'|'updatedAt'>);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create diagnosis' }, { status: 500 });
  }
}
