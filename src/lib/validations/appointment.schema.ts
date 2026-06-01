import { z } from "zod";
import { APPOINTMENT_TYPES } from "@/lib/constants";

export const CreateAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(500),
  type: z.enum(APPOINTMENT_TYPES).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial().extend({
  status: z.enum(["confirmed", "pending", "cancelled", "completed"]).optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
