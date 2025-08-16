export interface Diagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  notes?: string;
  date: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
