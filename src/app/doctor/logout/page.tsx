"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DoctorLogout() {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // Clear session and redirect to doctor login
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-800">Signing you out…</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting to login.</p>
      </div>
    </div>
  );
}
