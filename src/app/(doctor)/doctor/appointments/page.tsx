"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason: string;
  notes?: string;
  status?: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
}

type TabKey = "today" | "upcoming" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "all", label: "All" },
];

const calendarIcon = (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const doctorId = user?.id ?? "1";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        setError("We couldn't load your appointments. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId]);

  // Dynamically computed today (the original bug hardcoded "2024-01-16").
  const todayStr = new Date().toDateString();
  const now = Date.now();

  const counts = useMemo(() => {
    const today = appointments.filter((a) => new Date(a.date).toDateString() === todayStr).length;
    const upcoming = appointments.filter((a) => new Date(a.date).getTime() >= now).length;
    return { today, upcoming, all: appointments.length };
  }, [appointments, todayStr, now]);

  const filtered = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    switch (activeTab) {
      case "today":
        return sorted.filter((a) => new Date(a.date).toDateString() === todayStr);
      case "upcoming":
        return sorted.filter((a) => new Date(a.date).getTime() >= now);
      case "all":
      default:
        return sorted;
    }
  }, [appointments, activeTab, todayStr, now]);

  const handleStatusChange = async (id: string, status: "confirmed" | "cancelled") => {
    setUpdatingId(id);
    // Optimistic update so the UI stays responsive.
    const previous = appointments;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    try {
      await apiClient.patch(`/api/appointments/${id}`, { status });
      notify(
        status === "confirmed" ? "Appointment confirmed." : "Appointment cancelled.",
        "success"
      );
    } catch {
      // Roll back if the request fails.
      setAppointments(previous);
      notify("Could not update the appointment. Please try again.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const emptyDescription: Record<TabKey, string> = {
    today: "You have no appointments scheduled for today.",
    upcoming: "You have no upcoming appointments.",
    all: "No appointments have been booked with you yet.",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your patient appointments and schedule</p>
        </header>

        {error && (
          <Card padding="md" className="mb-6 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Appointment filters"
          className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm w-fit"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.key;
            const count = counts[tab.key];
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  selected ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="md">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12" circle />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={calendarIcon}
              title="No appointments found"
              description={emptyDescription[activeTab]}
            />
          </Card>
        ) : (
          <ul className="space-y-4">
            {filtered.map((apt) => {
              const status = apt.status ?? "pending";
              return (
                <li key={apt.id}>
                  <Card padding="md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <Avatar name={apt.patientId} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className="text-base font-semibold text-gray-900">
                              Patient {apt.patientId}
                            </h2>
                            <Badge variant={statusToBadgeVariant(status)}>{status}</Badge>
                          </div>
                          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-gray-600">
                            <span>{formatDate(apt.date)}</span>
                            <span>{formatTime(apt.date)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Reason:</span> {apt.reason}
                          </p>
                          {apt.notes && (
                            <p className="text-sm text-gray-500 mt-0.5">
                              <span className="font-medium">Notes:</span> {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {status === "pending" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="success"
                            loading={updatingId === apt.id}
                            disabled={updatingId === apt.id}
                            onClick={() => handleStatusChange(apt.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={updatingId === apt.id}
                            onClick={() => handleStatusChange(apt.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
