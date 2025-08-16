import { NextRequest, NextResponse } from 'next/server';
import type { Prescription } from '../../../../types/prescription';
import { prescriptionStore } from '../store';

// GET - Fetch a single prescription by ID
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  const prescription = prescriptionStore.findById(id);

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
  const existing = prescriptionStore.findById(id);

  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Prescription not found' },
      { status: 404 }
    );
  }

  const updatedPrescription = prescriptionStore.update(id, {
    medicineName: body.medicineName ?? existing.medicineName,
    dosage: body.dosage ?? existing.dosage,
    duration: body.duration ?? existing.duration,
    notes: body.notes ?? existing.notes,
    prescriptionDate: body.prescriptionDate ?? existing.prescriptionDate,
  } as Partial<Prescription>);

  return NextResponse.json({
    success: true,
    data: updatedPrescription!,
    message: 'Prescription updated successfully'
  });
}

// DELETE - Delete a prescription
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  const existing = prescriptionStore.findById(id);

  if (!existing) {
    return NextResponse.json(
      { success: false, error: 'Prescription not found' },
      { status: 404 }
    );
  }

  const deleted = prescriptionStore.remove(id)!;

  return NextResponse.json({
    success: true,
    data: deleted,
    message: 'Prescription deleted successfully'
  });
}


