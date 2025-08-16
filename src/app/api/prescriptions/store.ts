import type { Prescription } from '../../../types/prescription';

// In-memory mock database for prescriptions
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

export const prescriptionStore = {
  all(): Prescription[] {
    return prescriptions;
  },

  findById(id: string): Prescription | undefined {
    return prescriptions.find(p => p.id === id);
  },

  create(data: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Prescription {
    const now = new Date().toISOString();
    const p: Prescription = {
      ...data,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    prescriptions.push(p);
    return p;
  },

  update(id: string, patch: Partial<Prescription>): Prescription | undefined {
    const idx = prescriptions.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const updated: Prescription = {
      ...prescriptions[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    prescriptions[idx] = updated;
    return updated;
  },

  remove(id: string): Prescription | undefined {
    const idx = prescriptions.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const [removed] = prescriptions.splice(idx, 1);
    return removed;
  }
};
