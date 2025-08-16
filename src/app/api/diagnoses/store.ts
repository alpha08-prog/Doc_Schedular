import type { Diagnosis } from '../../../types/diagnosis';

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

export const diagnosisStore = {
  all(): Diagnosis[] { return diagnoses; },
  create(data: Omit<Diagnosis,'id'|'createdAt'|'updatedAt'>): Diagnosis {
    const now = new Date().toISOString();
    const item: Diagnosis = { id: `diag-${Date.now()}`, ...data, createdAt: now, updatedAt: now };
    diagnoses.push(item);
    return item;
  }
};
