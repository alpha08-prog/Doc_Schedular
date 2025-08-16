import type { Appointment } from '../../../types/appointment';

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

export const appointmentStore = {
  all(): Appointment[] { return appointments; },
  create(data: Omit<Appointment,'id'|'createdAt'|'updatedAt'>): Appointment {
    const now = new Date().toISOString();
    const item: Appointment = { id: `apt-${Date.now()}`, ...data, createdAt: now, updatedAt: now };
    appointments.push(item);
    return item;
  }
};
