import type { Metadata } from "next";
import DoctorNavBar from "@/app/components/DoctorNavBar";

export const metadata: Metadata = {
  title: {
    template: "%s | Doctor Portal",
    default: "Doctor Portal — Doc Scheduler",
  },
  description:
    "Manage your appointments, patients, prescriptions, and reviews from the Doc Scheduler doctor portal.",
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main>{children}</main>
    </div>
  );
}
