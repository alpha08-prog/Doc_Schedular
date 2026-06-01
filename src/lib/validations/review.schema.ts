import { z } from "zod";

export const CreateReviewSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  patientId: z.string().min(1, "Patient is required"),
  patientName: z.string().min(1, "Patient name is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
