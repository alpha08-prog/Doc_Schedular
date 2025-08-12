import { NextRequest, NextResponse } from 'next/server';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

let appointments: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'patient-1',
    doctorId: '1',
    date: '2024-01-15T09:00:00Z',
    reason: 'Follow-up',
    notes: 'Blood pressure monitoring',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'apt-002',
    patientId: 'patient-2',
    doctorId: '1',
    date: '2024-01-16T11:30:00Z',
    reason: 'Acute pain',
    notes: 'Back pain assessment',
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
  },
  {
    id: 'apt-003',
    patientId: 'patient-1',
    doctorId: '1',
    date: '2024-02-10T08:00:00Z',
    reason: 'Routine checkup',
    notes: 'Review labs',
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-02-01T09:30:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    let data = [...appointments];
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
    const now = new Date().toISOString();
    const item: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      reason: body.reason,
      notes: body.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    appointments.push(item);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create appointment' }, { status: 500 });
  }
}
