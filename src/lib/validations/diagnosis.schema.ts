import { z } from "zod";

export const CreateDiagnosisSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().max(1000).optional(),
  date: z.string().min(1, "Date is required"),
});

export type CreateDiagnosisInput = z.infer<typeof CreateDiagnosisSchema>;
