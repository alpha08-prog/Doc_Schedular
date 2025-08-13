"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Patient Dashboard: /patient?patientId=patient-1&patientName=Sarah%20Johnson
// Shows quick links and patient's recent reviews with edit links.

type Review = {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewsResponse = {
  success: boolean;
  data: Review[];
  page?: number;
  pageSize?: number;
  total?: number;
};

export default function PatientDashboard({ searchParams }: { searchParams: Record<string, string> }) {
  const patientId = searchParams.patientId || "patient-1";
  const patientName = searchParams.patientName || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reviews?patientId=${encodeURIComponent(patientId)}&pageSize=10&sort=newest`);
        const json: ReviewsResponse = await res.json();
        if (!json.success) throw new Error("Failed to fetch");
        setReviews(json.data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Portal</h1>
          <p className="text-gray-600 text-sm mt-1">
            Welcome{patientName ? ", " : ""}
            {patientName ? <span className="font-semibold">{patientName}</span> : <span className="font-mono">{patientId}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="px-3 py-2 rounded border bg-white hover:bg-gray-50 shadow-sm">Home</Link>
          <Link
            href={`/patient/appointments?patientId=${encodeURIComponent(patientId)}${patientName ? `&patientName=${encodeURIComponent(patientName)}` : ''}`}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            My Appointments
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl border bg-white shadow-sm">
          <div className="text-sm text-gray-500">Quick Actions</div>
          <div className="mt-3 space-y-2">
            <Link
              href={`/patient/appointments?patientId=${encodeURIComponent(patientId)}${patientName ? `&patientName=${encodeURIComponent(patientName)}` : ''}`}
              className="block w-full text-center px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
            >
              View Appointments / Leave Review
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-white md:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">My Recent Reviews</div>
            <Link
              href={`/patient/appointments?patientId=${encodeURIComponent(patientId)}${patientName ? `&patientName=${encodeURIComponent(patientName)}` : ''}`}
              className="text-xs text-blue-600 hover:underline"
            >
              Go to Appointments
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-gray-600 text-sm p-4 rounded-md bg-gray-50">
              No reviews yet. Visit your appointments to leave one.
              <div className="mt-3">
                <Link
                  href={`/patient/appointments?patientId=${encodeURIComponent(patientId)}${patientName ? `&patientName=${encodeURIComponent(patientName)}` : ''}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Go to Appointments
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {reviews.map((r) => {
                const editHref = `/patient/appointments/${r.appointmentId}/review?patientId=${encodeURIComponent(r.patientId)}&doctorId=${encodeURIComponent(r.doctorId)}${patientName ? `&patientName=${encodeURIComponent(patientName)}` : ''}`;
                return (
                  <div key={r.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-gray-50 px-2 rounded-md">
                    <div>
                      <div className="text-sm text-gray-800 flex items-center gap-2">
                        <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5">
                          {r.rating}★
                        </span>
                        <span className="mx-2 text-gray-400">·</span>
                        <span className="text-gray-600">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-0.5">
                        {r.comment || <span className="italic text-gray-500">No comment</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Doctor ID: <span className="font-mono">{r.doctorId}</span> · Appointment: <span className="font-mono">{r.appointmentId}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={editHref} className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 shadow">
                        View / Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
