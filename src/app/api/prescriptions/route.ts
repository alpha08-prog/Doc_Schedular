import { NextRequest, NextResponse } from 'next/server';
import type { Prescription } from '../../../types/prescription';
import { prescriptionStore } from './store';

// GET - Fetch all prescriptions or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');
    const search = searchParams.get('search');

    let filteredPrescriptions = [...prescriptionStore.all()];

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
    
    // Basic validation
    if (!body.patientName || !body.medicineName || !body.dosage || !body.duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const created = prescriptionStore.create({
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: body.doctorId,
      appointmentId: body.appointmentId,
      medicineName: body.medicineName,
      dosage: body.dosage,
      duration: body.duration,
      notes: body.notes || '',
      prescriptionDate: body.prescriptionDate || new Date().toISOString().split('T')[0],
    } as Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>);

    return NextResponse.json({
      success: true,
      data: created,
      message: 'Prescription created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
