import BottomNavBar from "@/app/components/BottomNavBar";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavBar />
    </>
  );
}
