import { z } from "zod";

export const CreatePrescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  patientName: z.string().min(1, "Patient name is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentId: z.string().optional(),
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().max(1000).optional(),
  prescriptionDate: z.string().min(1, "Prescription date is required"),
});

export const UpdatePrescriptionSchema = CreatePrescriptionSchema.partial();

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;
export type UpdatePrescriptionInput = z.infer<typeof UpdatePrescriptionSchema>;
