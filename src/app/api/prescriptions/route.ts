import { NextRequest, NextResponse } from 'next/server';

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  appointmentId: string;
  medicineName: string;
  dosage: string;
  duration: string;
  notes: string;
  prescriptionDate: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data storage (in production, this would be a database)
let prescriptions: Prescription[] = [
  {
    id: '1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    doctorId: '1',
    appointmentId: 'apt-001',
    medicineName: 'Amoxicillin',
    dosage: '500mg twice daily',
    duration: '7 days',
    notes: 'Take with food. Complete the full course.',
    prescriptionDate: '2024-01-15',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    patientId: 'patient-2',
    patientName: 'Jane Smith',
    doctorId: '1',
    appointmentId: 'apt-002',
    medicineName: 'Ibuprofen',
    dosage: '400mg as needed',
    duration: '5 days',
    notes: 'For pain relief. Do not exceed 3 doses per day.',
    prescriptionDate: '2024-01-16',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }
];

// GET - Fetch all prescriptions or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');
    const search = searchParams.get('search');

    let filteredPrescriptions = [...prescriptions];

    // Filter by doctorId
    if (doctorId) {
      filteredPrescriptions = filteredPrescriptions.filter(p => p.doctorId === doctorId);
    }

    // Filter by patientId
    if (patientId) {
      filteredPrescriptions = filteredPrescriptions.filter(p => p.patientId === patientId);
    }

    // Filter by appointmentId
    if (appointmentId) {
      filteredPrescriptions = filteredPrescriptions.filter(p => p.appointmentId === appointmentId);
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPrescriptions = filteredPrescriptions.filter(p => 
        p.medicineName.toLowerCase().includes(searchLower) ||
        p.patientName.toLowerCase().includes(searchLower) ||
        p.notes.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredPrescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: filteredPrescriptions,
      total: filteredPrescriptions.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

// POST - Create a new prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPrescription: Prescription = {
      id: Date.now().toString(),
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: body.doctorId,
      appointmentId: body.appointmentId,
      medicineName: body.medicineName,
      dosage: body.dosage,
      duration: body.duration,
      notes: body.notes || '',
      prescriptionDate: body.prescriptionDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    prescriptions.push(newPrescription);

    return NextResponse.json({
      success: true,
      data: newPrescription,
      message: 'Prescription created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
