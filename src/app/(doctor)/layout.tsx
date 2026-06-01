import DoctorNavBar from "@/app/components/DoctorNavBar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavBar />
      <main>{children}</main>
    </div>
  );
}
