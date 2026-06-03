import { describe, it, expect } from "vitest";
import { CredentialsSchema, SignupSchema, DoctorSignupSchema } from "../auth.schema";
import { CreateAppointmentSchema } from "../appointment.schema";
import { CreateReviewSchema } from "../review.schema";

describe("auth schemas", () => {
  it("accepts valid credentials", () => {
    expect(CredentialsSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(CredentialsSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });

  it("rejects signup when passwords do not match", () => {
    const res = SignupSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password1",
      confirmPassword: "password2",
      role: "patient",
    });
    expect(res.success).toBe(false);
  });

  it("requires an 8-char doctor password", () => {
    const base = {
      firstName: "A",
      lastName: "B",
      email: "d@c.com",
      phone: "5551234",
      medicalLicense: "L1",
      specialty: "Cardiology",
      experience: "5-10 years",
    };
    expect(
      DoctorSignupSchema.safeParse({ ...base, password: "short", confirmPassword: "short" }).success
    ).toBe(false);
    expect(
      DoctorSignupSchema.safeParse({
        ...base,
        password: "longenough",
        confirmPassword: "longenough",
      }).success
    ).toBe(true);
  });
});

describe("appointment schema", () => {
  it("requires a reason of at least 3 chars", () => {
    const res = CreateAppointmentSchema.safeParse({
      patientId: "p1",
      doctorId: "1",
      date: "2026-07-01T10:00:00Z",
      reason: "no",
    });
    expect(res.success).toBe(false);
  });

  it("accepts a valid appointment", () => {
    const res = CreateAppointmentSchema.safeParse({
      patientId: "p1",
      doctorId: "1",
      date: "2026-07-01T10:00:00Z",
      reason: "Routine checkup",
      type: "Consultation",
    });
    expect(res.success).toBe(true);
  });
});

describe("review schema", () => {
  it("rejects a rating above 5", () => {
    const res = CreateReviewSchema.safeParse({
      appointmentId: "a1",
      patientId: "p1",
      patientName: "John",
      doctorId: "1",
      rating: 6,
    });
    expect(res.success).toBe(false);
  });

  it("accepts a rating with an optional comment", () => {
    const res = CreateReviewSchema.safeParse({
      appointmentId: "a1",
      patientId: "p1",
      patientName: "John",
      doctorId: "1",
      rating: 5,
    });
    expect(res.success).toBe(true);
  });
});
