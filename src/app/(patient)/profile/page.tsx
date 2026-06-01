"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import type { Appointment } from "@/types/appointment";
import type { Diagnosis } from "@/types/diagnosis";
import type { Prescription } from "@/types/prescription";
import type { ApiResponse } from "@/types/api";

interface Stats {
  appointments: number;
  diagnoses: number;
  prescriptions: number;
}

function countFrom<T>(res: ApiResponse<T[]>): number {
  return res.success ? res.data.length : 0;
}

const STAT_CARDS: { key: keyof Stats; label: string; accent: string }[] = [
  { key: "appointments", label: "Appointments", accent: "text-blue-600" },
  { key: "diagnoses", label: "Diagnoses", accent: "text-green-600" },
  { key: "prescriptions", label: "Prescriptions", accent: "text-purple-600" },
];

const QUICK_LINKS: { label: string; description: string; href: string }[] = [
  {
    label: "Book Appointment",
    description: "Find a doctor and schedule a visit",
    href: "/doctors",
  },
  { label: "Medical Records", description: "View diagnoses and prescriptions", href: "/records" },
];

export default function PatientProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();
  const patientId = user?.id ?? "patient-1";

  const [stats, setStats] = useState<Stats>({ appointments: 0, diagnoses: 0, prescriptions: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoadingStats(true);
      const id = encodeURIComponent(patientId);
      try {
        const [appointments, diagnoses, prescriptions] = await Promise.all([
          apiClient.get<ApiResponse<Appointment[]>>(`/api/appointments?patientId=${id}`),
          apiClient.get<ApiResponse<Diagnosis[]>>(`/api/diagnoses?patientId=${id}`),
          apiClient.get<ApiResponse<Prescription[]>>(`/api/prescriptions?patientId=${id}`),
        ]);
        if (!active) return;
        setStats({
          appointments: countFrom(appointments),
          diagnoses: countFrom(diagnoses),
          prescriptions: countFrom(prescriptions),
        });
      } catch {
        if (!active) return;
        notify("Unable to load your stats. Please try again.", "error");
      } finally {
        if (active) setLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      active = false;
    };
  }, [patientId, notify]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
            <p className="text-sm text-gray-600">Your personal information and activity</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map((stat) => (
            <Card key={stat.key} padding="md">
              <p className="text-sm text-gray-500">{stat.label}</p>
              {loadingStats ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className={`text-3xl font-bold ${stat.accent}`}>{stats[stat.key]}</p>
              )}
            </Card>
          ))}
        </div>

        {/* Profile details (read-only for now — Phase 5 adds editing) */}
        <Card padding="lg">
          <div className="flex items-center gap-4 mb-6">
            <Avatar size="xl" name={user?.name ?? "Patient"} />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {user?.name ?? "Patient"}
              </h2>
              <p className="text-sm text-gray-600 truncate">{user?.email || "No email on file"}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-gray-900">{user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-gray-900 break-words">{user?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Patient ID</dt>
              <dd className="font-mono text-sm text-gray-900">{patientId}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="text-gray-900 capitalize">{user?.role ?? "patient"}</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs text-gray-400">
            Profile editing is coming soon. Contact support to update your details.
          </p>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map((link) => (
            <Card
              key={link.href}
              as="button"
              variant="interactive"
              onClick={() => router.push(link.href)}
              className="text-left"
            >
              <h3 className="font-semibold text-gray-900">{link.label}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
