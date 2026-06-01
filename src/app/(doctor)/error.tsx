"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function DoctorPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Doctor portal error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L5.07 16a2 2 0 001.74 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page error</h2>
        <p className="text-gray-500 text-sm mb-6">
          This section of the doctor portal encountered an error. Try again or go back to the
          dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => (window.location.href = "/doctor/dashboard")}>
            Dashboard
          </Button>
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
