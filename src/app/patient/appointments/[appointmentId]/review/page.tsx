"use client";
import React, { useEffect, useMemo, useState } from "react";
import StarRating from "../../../../components/StarRating";
import Link from "next/link";

// This page expects search params: patientId, doctorId, patientName (optional)
// Example route: /patient/appointments/apt-001/review?patientId=patient-1&doctorId=1&patientName=Sarah%20Johnson

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

export default function AppointmentReviewPage({ params, searchParams }: { params: { appointmentId: string }; searchParams: Record<string, string> }) {
  const { appointmentId } = params;
  const patientId = searchParams.patientId || "patient-1";
  const doctorId = searchParams.doctorId || "1";
  const patientName = searchParams.patientName || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const canModify = useMemo(() => {
    if (!existing) return true;
    const created = new Date(existing.createdAt).getTime();
    const hours = (Date.now() - created) / (1000 * 60 * 60);
    return hours <= 24;
  }, [existing]);

  const remainingText = useMemo(() => {
    if (!existing) return "24h";
    const created = new Date(existing.createdAt).getTime();
    const msLeft = 24 * 3600000 - (Date.now() - created);
    if (msLeft <= 0) return "0h";
    const hrs = Math.floor(msLeft / 3600000);
    const mins = Math.floor((msLeft % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  }, [existing]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews?appointmentId=${encodeURIComponent(appointmentId)}&patientId=${encodeURIComponent(patientId)}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const r = json.data[0] as Review;
          setExisting(r);
          setRating(r.rating);
          setComment(r.comment || "");
        }
      } catch (e) {
        setError("Failed to load review");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appointmentId, patientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (existing) {
        const res = await fetch(`/api/reviews/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to update");
        setExisting(json.data);
      } else {
        const res = await fetch(`/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId, patientId, doctorId, patientName, rating, comment }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to create");
        setExisting(json.data);
      }
    } catch (e: any) {
      setError(e.message || "Unable to save review");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("Delete your review?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${existing.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete");
      setExisting(null);
      setRating(0);
      setComment("");
    } catch (e: any) {
      setError(e.message || "Unable to delete review");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Review</h1>
          <p className="text-gray-600 text-sm mt-1">Appointment: <span className="font-mono">{appointmentId}</span></p>
        </div>
        <Link href="/" className="px-3 py-2 rounded border bg-white hover:bg-gray-50 shadow-sm text-sm">Home</Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm border border-red-200">{error}</div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded" />
        </div>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Your Rating</label>
              <div className="flex items-center gap-3">
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                  <span className="text-xs text-gray-600">{rating} / 5</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Review</label>
              <textarea
                className="w-full border rounded-md p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
              />
              <div className="text-xs text-gray-500 mt-1">Be constructive and respectful. Reviews help doctors and future patients.</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={saving || rating < 1}
                className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 shadow"
              >
                {existing ? "Update Review" : "Submit Review"}
              </button>
              {existing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || !canModify}
                  className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 shadow"
                >
                  Delete
                </button>
              )}
              {existing && (
                <span className="text-xs text-gray-500 ml-2">Edit/Delete allowed: {canModify ? remainingText + " left" : "window expired"}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {existing && (
        <div className="mt-6 text-sm text-gray-600">
          <div className="rounded-md border bg-white p-4 shadow-sm">
            <div>Created: {new Date(existing.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(existing.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
