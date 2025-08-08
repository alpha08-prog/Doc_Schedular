import { NextRequest, NextResponse } from 'next/server';
import type { Prescription } from '../route';

// Mock data
let prescriptions: Prescription[] = [];

// GET - Fetch a single prescription by ID
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  const prescription = prescriptions.find(p => p.id === id);

  if (!prescription) {
    return NextResponse.json(
      { success: false, error: 'Prescription not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: prescription
  });
}

// PUT - Update a prescription
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  const body = await request.json();
  const index = prescriptions.findIndex(p => p.id === id);

  if (index === -1) {
    return NextResponse.json(
      { success: false, error: 'Prescription not found' },
      { status: 404 }
    );
  }

  const updatedPrescription: Prescription = {
    ...prescriptions[index],
    medicineName: body.medicineName || prescriptions[index].medicineName,
    dosage: body.dosage || prescriptions[index].dosage,
    duration: body.duration || prescriptions[index].duration,
    notes: body.notes !== undefined ? body.notes : prescriptions[index].notes,
    prescriptionDate: body.prescriptionDate || prescriptions[index].prescriptionDate,
    updatedAt: new Date().toISOString()
  };

  prescriptions[index] = updatedPrescription;

  return NextResponse.json({
    success: true,
    data: updatedPrescription,
    message: 'Prescription updated successfully'
  });
}

// DELETE - Delete a prescription
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  const index = prescriptions.findIndex(p => p.id === id);

  if (index === -1) {
    return NextResponse.json(
      { success: false, error: 'Prescription not found' },
      { status: 404 }
    );
  }

  const deleted = prescriptions.splice(index, 1)[0];

  return NextResponse.json({
    success: true,
    data: deleted,
    message: 'Prescription deleted successfully'
  });
}


