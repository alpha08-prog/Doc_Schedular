export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
