import { NextRequest, NextResponse } from 'next/server';

export interface Diagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  notes?: string;
  date: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

let diagnoses: Diagnosis[] = [
  {
    id: 'diag-001',
    patientId: 'patient-1',
    doctorId: '1',
    appointmentId: 'apt-001',
    diagnosis: 'Hypertension',
    notes: 'Lifestyle modification advised',
    date: '2024-01-15T09:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'diag-002',
    patientId: 'patient-2',
    doctorId: '1',
    appointmentId: 'apt-002',
    diagnosis: 'Acute lower back pain',
    notes: 'Physiotherapy recommended',
    date: '2024-01-16T12:00:00Z',
    createdAt: '2024-01-16T12:10:00Z',
    updatedAt: '2024-01-16T12:10:00Z',
  },
  {
    id: 'diag-003',
    patientId: 'patient-1',
    doctorId: '1',
    appointmentId: 'apt-003',
    diagnosis: 'Routine checkup - stable',
    notes: 'Continue current meds',
    date: '2024-02-10T08:30:00Z',
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    let data = [...diagnoses];
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
    const now = new Date().toISOString();
    const item: Diagnosis = {
      id: `diag-${Date.now()}`,
      patientId: body.patientId,
      doctorId: body.doctorId,
      appointmentId: body.appointmentId,
      diagnosis: body.diagnosis,
      notes: body.notes || '',
      date: body.date,
      createdAt: now,
      updatedAt: now,
    };
    diagnoses.push(item);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create diagnosis' }, { status: 500 });
  }
}
