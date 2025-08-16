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
  prescriptionDate: string; // yyyy-mm-dd
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
