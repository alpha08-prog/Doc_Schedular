import type { Metadata } from "next";
import BottomNavBar from "@/app/components/BottomNavBar";

export const metadata: Metadata = {
  title: {
    template: "%s | Doc Scheduler",
    default: "Doc Scheduler — Book Appointments Online",
  },
  description:
    "Find and book appointments with top doctors. View your medical records, prescriptions, and health history in one place.",
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavBar />
    </>
  );
}
