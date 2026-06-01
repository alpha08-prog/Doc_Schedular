"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
}

interface DerivedPatient {
  patientId: string;
  appointmentCount: number;
  lastVisit: string; // ISO of most recent appointment
  lastReason: string;
}

const searchIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const usersIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

export default function DoctorPatients() {
  const { user } = useAuth();
  const router = useRouter();
  const doctorId = user?.id ?? "1";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    apiClient
      .get<AppointmentsResponse>(`/api/appointments?doctorId=${encodeURIComponent(doctorId)}`)
      .then((res) => {
        if (!active) return;
        setAppointments(res.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your patients. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId]);

  // Derive unique patients from appointment history.
  const patients = useMemo<DerivedPatient[]>(() => {
    const byPatient = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const list = byPatient.get(apt.patientId) ?? [];
      list.push(apt);
      byPatient.set(apt.patientId, list);
    }

    return Array.from(byPatient.entries())
      .map(([patientId, list]) => {
        const sorted = [...list].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const mostRecent = sorted[0];
        return {
          patientId,
          appointmentCount: list.length,
          lastVisit: mostRecent.date,
          lastReason: mostRecent.reason,
        };
      })
      .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => p.patientId.toLowerCase().includes(q));
  }, [patients, search]);

  const goToHistory = (patientId: string) => {
    router.push(`/doctor/patients/${encodeURIComponent(patientId)}/history`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            Your patients, derived from their appointment history
          </p>
        </header>

        {error && (
          <Card padding="md" className="mb-6 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Search */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search by patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftAddon={searchIcon}
            aria-label="Search patients by ID"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={usersIcon}
              title={search ? "No matching patients" : "No patients yet"}
              description={
                search
                  ? `No patients match "${search}".`
                  : "Patients will appear here once they book appointments with you."
              }
              action={
                search
                  ? { label: "Clear search", onClick: () => setSearch(""), variant: "secondary" }
                  : undefined
              }
            />
          </Card>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((patient) => (
              <li key={patient.patientId}>
                <Card
                  as="button"
                  variant="interactive"
                  padding="md"
                  onClick={() => goToHistory(patient.patientId)}
                  className="w-full text-left"
                  aria-label={`View medical history for patient ${patient.patientId}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={patient.patientId} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-semibold text-gray-900 truncate">
                          Patient {patient.patientId}
                        </h2>
                        <Badge variant="info">
                          {patient.appointmentCount}{" "}
                          {patient.appointmentCount === 1 ? "visit" : "visits"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Last visit: {formatDate(patient.lastVisit)}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        <span className="font-medium">Recent:</span> {patient.lastReason}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
