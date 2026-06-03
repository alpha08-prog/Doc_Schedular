"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { formatDate, formatTime } from "@/lib/utils";

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  date: string;
  reason: string;
  notes?: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface AppointmentsResponse {
  success: boolean;
  data: Appointment[];
}

function greeting(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

const calendarIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const usersIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const clockIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const trendIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <Card padding="md" className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
    </Card>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorId = (user as { doctorProfileId?: string } | null)?.doctorProfileId ?? "1";
  const doctorName = user?.name ?? "Doctor";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed once on mount — no per-second clock.
  const today = useMemo(() => new Date(), []);
  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const stats = useMemo(() => {
    const todayStr = today.toDateString();

    const startOfWeek = new Date(today);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const now = today.getTime();

    const todays = appointments.filter((a) => new Date(a.date).toDateString() === todayStr);

    const thisWeek = appointments.filter((a) => {
      const t = new Date(a.date).getTime();
      return t >= startOfWeek.getTime() && t < endOfWeek.getTime();
    });

    const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

    const upcoming = appointments
      .filter((a) => new Date(a.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return {
      todayCount: todays.length,
      uniquePatients,
      weekCount: thisWeek.length,
      upcomingCount: upcoming.length,
      upcoming,
    };
  }, [appointments, today]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting(today.getHours())}, Dr. {doctorName}
          </h1>
          <p className="text-gray-600 mt-1">{todayLabel}</p>
        </header>

        {error && (
          <Card padding="md" className="mb-6 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Stats */}
        <section aria-label="Summary statistics" className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Today's Appointments"
                value={stats.todayCount}
                icon={calendarIcon}
                accent="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Total Patients"
                value={stats.uniquePatients}
                icon={usersIcon}
                accent="bg-green-100 text-green-600"
              />
              <StatCard
                label="Appointments This Week"
                value={stats.weekCount}
                icon={trendIcon}
                accent="bg-purple-100 text-purple-600"
              />
              <StatCard
                label="Upcoming"
                value={stats.upcomingCount}
                icon={clockIcon}
                accent="bg-orange-100 text-orange-600"
              />
            </div>
          )}
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming appointments */}
          <div className="lg:col-span-2">
            <Card padding="md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                <Link
                  href="/doctor/appointments"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View all
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : stats.upcoming.length === 0 ? (
                <EmptyState
                  icon={clockIcon}
                  title="No upcoming appointments"
                  description="New appointments booked by patients will appear here."
                />
              ) : (
                <ul className="space-y-3">
                  {stats.upcoming.map((apt) => (
                    <li
                      key={apt.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Avatar name={apt.patientName ?? apt.patientId} size="md" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {apt.patientName ?? `Patient ${apt.patientId}`}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{apt.reason}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-medium text-gray-900">{formatTime(apt.date)}</p>
                        <p className="text-xs text-gray-500 mb-1">{formatDate(apt.date)}</p>
                        <Badge variant={statusToBadgeVariant(apt.status ?? "pending")}>
                          {apt.status ?? "pending"}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <aside>
            <Card padding="md">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <nav className="space-y-3">
                <QuickAction
                  href="/doctor/appointments"
                  label="Manage Appointments"
                  icon={calendarIcon}
                  accent="bg-blue-50 text-blue-600"
                />
                <QuickAction
                  href="/doctor/patients"
                  label="View Patients"
                  icon={usersIcon}
                  accent="bg-green-50 text-green-600"
                />
                <QuickAction
                  href="/doctor/profile"
                  label="Edit Profile"
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                  accent="bg-purple-50 text-purple-600"
                />
              </nav>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
}

function QuickAction({ href, label, icon, accent }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </span>
      <span className="font-medium text-gray-900">{label}</span>
    </Link>
  );
}
