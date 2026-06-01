export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed";
export type AppointmentType = "Consultation" | "Follow-up" | "Check-up" | "Treatment" | "Emergency";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO datetime
  reason: string;
  notes?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  createdAt: string;
  updatedAt: string;
}
