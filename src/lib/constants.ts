export const APP_NAME = "Doc Scheduler";
export const APP_DESCRIPTION = "Doctor Appointment Booking Platform";

export const ROUTES = {
  home: "/",
  login: "/login",
  otp: "/otp",
  doctors: "/doctors",
  booking: "/booking",
  patient: "/patient",
  records: "/records",
  profile: "/profile",
  doctorLogin: "/doctor/login",
  doctorSignup: "/doctor/signup",
  doctorDashboard: "/doctor/dashboard",
  doctorAppointments: "/doctor/appointments",
  doctorCalendar: "/doctor/calendar",
  doctorPatients: "/doctor/patients",
  doctorPrescriptions: "/doctor/prescriptions",
  doctorReviews: "/doctor/reviews",
  doctorProfile: "/doctor/profile",
  doctorLogout: "/doctor/logout",
} as const;

export const APPOINTMENT_STATUSES = ["confirmed", "pending", "cancelled", "completed"] as const;

export const APPOINTMENT_TYPES = [
  "Consultation",
  "Follow-up",
  "Check-up",
  "Treatment",
  "Emergency",
] as const;

export const SPECIALTIES = [
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "General Physician",
] as const;
