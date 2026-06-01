export type UserRole = "patient" | "doctor";

export interface PatientUser {
  id: string;
  name: string;
  email: string;
  role: "patient";
  phone?: string;
  age?: number;
  bloodType?: string;
  conditions?: string[];
}

export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  role: "doctor";
  specialty?: string;
  licenseNumber?: string;
  experience?: string;
  fee?: number;
}

export type User = PatientUser | DoctorUser;
