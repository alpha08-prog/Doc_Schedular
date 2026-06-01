import type { Appointment } from "../../../types/appointment";

const appointments: Appointment[] = [
  {
    id: "apt-001",
    patientId: "patient-1",
    doctorId: "1",
    date: "2026-06-05T09:00:00Z",
    reason: "Follow-up consultation",
    notes: "Blood pressure monitoring",
    status: "confirmed",
    type: "Follow-up",
    createdAt: "2026-05-28T10:00:00Z",
    updatedAt: "2026-05-28T10:00:00Z",
  },
  {
    id: "apt-002",
    patientId: "patient-2",
    doctorId: "1",
    date: "2026-06-06T11:30:00Z",
    reason: "Acute lower back pain",
    notes: "Patient reports pain radiating to left leg",
    status: "pending",
    type: "Consultation",
    createdAt: "2026-05-30T14:20:00Z",
    updatedAt: "2026-05-30T14:20:00Z",
  },
  {
    id: "apt-003",
    patientId: "patient-1",
    doctorId: "1",
    date: "2026-06-10T08:00:00Z",
    reason: "Routine annual checkup",
    notes: "Review lab results from last week",
    status: "confirmed",
    type: "Check-up",
    createdAt: "2026-06-01T09:30:00Z",
    updatedAt: "2026-06-01T09:30:00Z",
  },
  {
    id: "apt-004",
    patientId: "patient-3",
    doctorId: "1",
    date: "2026-06-02T14:00:00Z",
    reason: "Arthritis management",
    status: "completed",
    type: "Follow-up",
    createdAt: "2026-05-25T08:00:00Z",
    updatedAt: "2026-06-02T15:00:00Z",
  },
  {
    id: "apt-005",
    patientId: "patient-2",
    doctorId: "1",
    date: "2026-06-12T10:00:00Z",
    reason: "Diabetes review and medication adjustment",
    status: "pending",
    type: "Consultation",
    createdAt: "2026-06-01T11:00:00Z",
    updatedAt: "2026-06-01T11:00:00Z",
  },
];

export const appointmentStore = {
  all(): Appointment[] {
    return appointments;
  },

  findById(id: string): Appointment | undefined {
    return appointments.find((a) => a.id === id);
  },

  create(data: Omit<Appointment, "id" | "createdAt" | "updatedAt">): Appointment {
    const now = new Date().toISOString();
    const item: Appointment = { id: `apt-${Date.now()}`, ...data, createdAt: now, updatedAt: now };
    appointments.push(item);
    return item;
  },

  update(id: string, patch: Partial<Appointment>): Appointment | undefined {
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const updated: Appointment = {
      ...appointments[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    appointments[idx] = updated;
    return updated;
  },
};
