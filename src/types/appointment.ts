export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO date
  reason: string;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
