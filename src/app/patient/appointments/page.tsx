"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Page: /patient/appointments?patientId=patient-1&patientName=Sarah%20Johnson
// Lists appointments for a given patient and provides a Leave Review link per appointment.

type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type FetchResponse = {
  success: boolean;
  data: Appointment[];
  total: number;
};

export default function PatientAppointmentsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const patientId = searchParams.patientId || "patient-1";
  const patientName = searchParams.patientName || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Appointment[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/appointments?patientId=${encodeURIComponent(patientId)}`);
        const json: FetchResponse = await res.json();
        if (!json.success) throw new Error("Failed to fetch");
        setRows(json.data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-gray-600 text-sm mt-1">
            Patient: {patientName ? <span className="font-semibold">{patientName}</span> : <span className="font-mono">{patientId}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="px-3 py-2 rounded border bg-white hover:bg-gray-50 shadow-sm">Home</Link>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm border border-red-200">{error}</div>}

      <div className="rounded-xl border bg-white divide-y shadow-sm">
        {loading ? (
          <div className="p-4 animate-pulse space-y-3">
            <div className="h-3 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-gray-600 bg-gray-50">No appointments found.</div>
        ) : (
          rows.map((apt) => {
            const reviewHref = `/patient/appointments/${apt.id}/review?patientId=${encodeURIComponent(apt.patientId)}&doctorId=${encodeURIComponent(apt.doctorId)}${patientName ? `&patientName=${encodeURIComponent(patientName)}` : ''}`;
            return (
              <div key={apt.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50">
                <div>
                  <div className="font-medium">{new Date(apt.date).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">Reason: {apt.reason}</div>
                  {apt.notes && <div className="text-xs text-gray-500 mt-0.5">Notes: {apt.notes}</div>}
                  <div className="text-xs text-gray-500 mt-0.5">Doctor ID: <span className="font-mono">{apt.doctorId}</span> · Appointment ID: <span className="font-mono">{apt.id}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={reviewHref} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 shadow">Leave Review</Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
