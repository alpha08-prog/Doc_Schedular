"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDate, formatTime } from "@/lib/utils";
import type { Appointment } from "@/types/appointment";
import type { ApiResponse } from "@/types/api";

// API appointments have no status field — default every record to "confirmed".
const DEFAULT_STATUS = "confirmed";

type TabKey = "all" | "upcoming" | "past";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const CalendarIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card padding="md" className="animate-fade-in">
      <div className="flex items-center gap-4">
        <Avatar size="lg" name="Doctor" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{appointment.reason}</h3>
              {appointment.notes && (
                <p className="text-sm text-gray-500 truncate">{appointment.notes}</p>
              )}
            </div>
            <Badge variant={statusToBadgeVariant(DEFAULT_STATUS)} dot>
              {DEFAULT_STATUS.charAt(0).toUpperCase() + DEFAULT_STATUS.slice(1)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              {CalendarIcon}
              {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1.5">
              {ClockIcon}
              {formatTime(appointment.date)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();
  const patientId = user?.id ?? "patient-1";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<ApiResponse<Appointment[]>>(
          `/api/appointments?patientId=${encodeURIComponent(patientId)}`
        );
        if (!active) return;
        if (res.success) {
          setAppointments(res.data);
        } else {
          throw new ApiError(500, res.error);
        }
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof ApiError ? err.message : "Unable to load appointments. Please try again.";
        setError(message);
        notify(message, "error");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAppointments();
    return () => {
      active = false;
    };
  }, [patientId, notify]);

  // Counts per tab. "today" boundary = start of the current day.
  const { all, upcoming, past } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const boundary = startOfToday.getTime();

    const upcomingList: Appointment[] = [];
    const pastList: Appointment[] = [];
    for (const appt of appointments) {
      if (new Date(appt.date).getTime() >= boundary) upcomingList.push(appt);
      else pastList.push(appt);
    }
    return { all: appointments, upcoming: upcomingList, past: pastList };
  }, [appointments]);

  const tabCounts: Record<TabKey, number> = {
    all: all.length,
    upcoming: upcoming.length,
    past: past.length,
  };

  const currentAppointments =
    activeTab === "upcoming" ? upcoming : activeTab === "past" ? past : all;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-24">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card
            as="button"
            variant="interactive"
            onClick={() => router.push("/doctors")}
            className="text-left flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <span>
              <span className="block font-semibold text-gray-900">Find Doctor</span>
              <span className="block text-sm text-gray-600">Search and book a specialist</span>
            </span>
          </Card>

          <Card
            as="button"
            variant="interactive"
            onClick={() => router.push("/records")}
            className="text-left flex items-center gap-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>
            <span>
              <span className="block font-semibold text-gray-900">Records</span>
              <span className="block text-sm text-gray-600">View medical history</span>
            </span>
          </Card>
        </div>

        {/* Tabs + content */}
        <Card padding="none" className="overflow-hidden animate-scale-in">
          <div className="border-b border-gray-100">
            <nav className="flex" role="tablist" aria-label="Appointment filters">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {tab.label}
                      {!loading && tabCounts[tab.key] > 0 && (
                        <span
                          className={`inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full ${
                            isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tabCounts[tab.key]}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading appointments">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="Something went wrong"
                description={error}
                action={{ label: "Retry", onClick: () => router.refresh() }}
              />
            ) : currentAppointments.length > 0 ? (
              <div className="space-y-4">
                {currentAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No appointments yet"
                description={
                  activeTab === "all"
                    ? "You haven't booked any appointments. Find a doctor to get started."
                    : `You have no ${activeTab} appointments.`
                }
                action={{ label: "Find a Doctor", onClick: () => router.push("/doctors") }}
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
