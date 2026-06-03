import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient, AppointmentStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

function readJson<T>(relativePath: string): T {
  const raw = readFileSync(join(process.cwd(), relativePath), "utf-8");
  return JSON.parse(raw) as T;
}

interface DoctorSeed {
  id: number;
  name: string;
  specialty: string;
  degrees?: string;
  fellow?: string;
  tags?: string[];
  about?: string;
  availability?: string[];
  image?: string;
  status?: string;
  bio?: string;
  time?: string;
}

async function main() {
  console.log("Seeding database...");

  const doctorsJson = readJson<DoctorSeed[]>("src/data/doctors.json");
  const timeSlots = readJson<string[]>("src/data/timeslots.json");

  // Demo password reused for every seeded account.
  const passwordHash = await hashPassword("password123");

  // --- Clean transactional tables (idempotent re-seed) -------------------
  await prisma.review.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.timeSlot.deleteMany();

  // --- TimeSlots ----------------------------------------------------------
  await prisma.timeSlot.createMany({
    data: timeSlots.map((label, order) => ({ label, order })),
  });

  // --- Doctor catalog + linked login users --------------------------------
  // First name → login email, e.g. "Dr. Priya Sharma" → priya@clinic.com
  for (const d of doctorsJson) {
    const firstName = d.name.replace(/^Dr\.?\s*/i, "").split(" ")[0].toLowerCase();
    const email = `${firstName}@clinic.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, name: d.name },
      create: { email, passwordHash, name: d.name, role: "doctor" },
    });

    await prisma.doctor.upsert({
      where: { id: String(d.id) },
      update: {
        userId: user.id,
        name: d.name,
        specialty: d.specialty,
        image: d.image,
        status: d.status,
        bio: d.bio,
        time: d.time,
        degrees: d.degrees,
        fellow: d.fellow,
        about: d.about,
        tags: d.tags ?? [],
        availability: d.availability ?? [],
      },
      create: {
        id: String(d.id),
        userId: user.id,
        name: d.name,
        specialty: d.specialty,
        image: d.image,
        status: d.status,
        bio: d.bio,
        time: d.time,
        degrees: d.degrees,
        fellow: d.fellow,
        about: d.about,
        tags: d.tags ?? [],
        availability: d.availability ?? [],
      },
    });
  }

  // --- Demo patients ------------------------------------------------------
  const patientSeed = [
    { key: "patient-1", name: "John Doe", email: "john@example.com", age: 34, bloodType: "O+", conditions: ["Hypertension"] },
    { key: "patient-2", name: "Jane Smith", email: "jane@example.com", age: 29, bloodType: "A+", conditions: [] },
    { key: "patient-3", name: "Sarah Johnson", email: "sarah@example.com", age: 41, bloodType: "B+", conditions: ["Arthritis"] },
  ];

  const patientId: Record<string, string> = {};
  for (const p of patientSeed) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, passwordHash, age: p.age, bloodType: p.bloodType, conditions: p.conditions },
      create: {
        email: p.email,
        passwordHash,
        name: p.name,
        role: "patient",
        age: p.age,
        bloodType: p.bloodType,
        conditions: p.conditions,
      },
    });
    patientId[p.key] = user.id;
  }

  // --- Appointments (ids preserved so prescriptions/reviews/diagnoses line up) ---
  const appointments: Array<{
    id: string;
    patient: string;
    date: string;
    reason: string;
    notes?: string;
    status: AppointmentStatus;
    type: string;
  }> = [
    { id: "apt-001", patient: "patient-1", date: "2026-06-05T09:00:00Z", reason: "Follow-up consultation", notes: "Blood pressure monitoring", status: "confirmed", type: "Follow-up" },
    { id: "apt-002", patient: "patient-2", date: "2026-06-06T11:30:00Z", reason: "Acute lower back pain", notes: "Patient reports pain radiating to left leg", status: "pending", type: "Consultation" },
    { id: "apt-003", patient: "patient-1", date: "2026-06-10T08:00:00Z", reason: "Routine annual checkup", notes: "Review lab results from last week", status: "confirmed", type: "Check-up" },
    { id: "apt-004", patient: "patient-3", date: "2026-06-02T14:00:00Z", reason: "Arthritis management", status: "completed", type: "Follow-up" },
    { id: "apt-005", patient: "patient-2", date: "2026-06-12T10:00:00Z", reason: "Diabetes review and medication adjustment", status: "pending", type: "Consultation" },
  ];

  for (const a of appointments) {
    await prisma.appointment.create({
      data: {
        id: a.id,
        patientId: patientId[a.patient],
        doctorId: "1",
        date: new Date(a.date),
        reason: a.reason,
        notes: a.notes ?? null,
        status: a.status,
        type: a.type,
      },
    });
  }

  // --- Prescriptions ------------------------------------------------------
  await prisma.prescription.createMany({
    data: [
      { id: "1", patientId: patientId["patient-1"], patientName: "John Doe", doctorId: "1", appointmentId: "apt-001", medicineName: "Amoxicillin", dosage: "500mg twice daily", duration: "7 days", notes: "Take with food. Complete the full course.", prescriptionDate: "2026-06-05" },
      { id: "2", patientId: patientId["patient-2"], patientName: "Jane Smith", doctorId: "1", appointmentId: "apt-002", medicineName: "Ibuprofen", dosage: "400mg as needed", duration: "5 days", notes: "For pain relief. Do not exceed 3 doses per day.", prescriptionDate: "2026-06-06" },
    ],
  });

  // --- Reviews ------------------------------------------------------------
  await prisma.review.createMany({
    data: [
      { id: "rev-001", appointmentId: "apt-001", patientId: patientId["patient-1"], patientName: "John Doe", doctorId: "1", rating: 5, comment: "Great experience, very attentive." },
      { id: "rev-002", appointmentId: "apt-002", patientId: patientId["patient-2"], patientName: "Jane Smith", doctorId: "1", rating: 4, comment: "Helpful and professional." },
    ],
  });

  // --- Diagnoses ----------------------------------------------------------
  await prisma.diagnosis.createMany({
    data: [
      { id: "diag-001", patientId: patientId["patient-1"], doctorId: "1", appointmentId: "apt-001", diagnosis: "Hypertension", notes: "Lifestyle modification advised", date: new Date("2026-06-05T09:30:00Z") },
      { id: "diag-002", patientId: patientId["patient-2"], doctorId: "1", appointmentId: "apt-002", diagnosis: "Acute lower back pain", notes: "Physiotherapy recommended", date: new Date("2026-06-06T12:00:00Z") },
      { id: "diag-003", patientId: patientId["patient-1"], doctorId: "1", appointmentId: "apt-003", diagnosis: "Routine checkup - stable", notes: "Continue current meds", date: new Date("2026-06-10T08:30:00Z") },
    ],
  });

  console.log("Seed complete:");
  console.log("  Doctors :", doctorsJson.length, "(login e.g. priya@clinic.com / password123)");
  console.log("  Patients:", patientSeed.length, "(login e.g. john@example.com / password123)");
  console.log("  TimeSlots:", timeSlots.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
