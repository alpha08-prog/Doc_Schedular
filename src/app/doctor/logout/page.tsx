"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DoctorLogout() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Clear auth/session here
    setTimeout(() => {
      router.push("/doctor/login");
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <div className="text-xl font-semibold mb-2">Logging out...</div>
        <div className="text-gray-500">You will be redirected to login.</div>
      </div>
    </div>
  );
}