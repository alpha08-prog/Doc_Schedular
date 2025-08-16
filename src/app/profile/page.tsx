"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Simple patient profile stored locally for demo purposes
// In a real app, this would be persisted to a backend and tied to auth

type PatientProfile = {
  patientId: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  conditions?: string;
};

const DEFAULT_PROFILE: PatientProfile = {
  patientId: "patient-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "",
  age: 30,
  conditions: "",
};

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick stats
  const [loadingStats, setLoadingStats] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [diagnosesCount, setDiagnosesCount] = useState(0);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);

  // Load profile from localStorage if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem("patientProfile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.patientId]);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const [aRes, dRes, pRes] = await Promise.all([
        fetch(`/api/appointments?patientId=${encodeURIComponent(profile.patientId)}`),
        fetch(`/api/diagnoses?patientId=${encodeURIComponent(profile.patientId)}`),
        fetch(`/api/prescriptions?patientId=${encodeURIComponent(profile.patientId)}`),
      ]);
      const [aJson, dJson, pJson] = await Promise.all([aRes.json(), dRes.json(), pRes.json()]);
      setAppointmentsCount(Array.isArray(aJson?.data) ? aJson.data.length : 0);
      setDiagnosesCount(Array.isArray(dJson?.data) ? dJson.data.length : 0);
      setPrescriptionsCount(Array.isArray(pJson?.data) ? pJson.data.length : 0);
    } catch (e) {
      // ignore for demo
    } finally {
      setLoadingStats(false);
    }
  }

  function onEdit() {
    setEditing(true);
    setError(null);
  }

  function onCancel() {
    setEditing(false);
    setError(null);
    // reload from storage to discard changes
    try {
      const raw = localStorage.getItem("patientProfile");
      if (raw) setProfile(JSON.parse(raw));
      else setProfile(DEFAULT_PROFILE);
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!profile.name.trim() || !profile.email.trim()) {
        setError("Name and Email are required");
        return;
      }
      // very basic email check
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) {
        setError("Please enter a valid email address");
        return;
      }
      localStorage.setItem("patientProfile", JSON.stringify(profile));
      setEditing(false);
    } catch (e: any) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Patient Profile</h1>
          <p className="text-gray-600 text-sm">Manage your personal information</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="px-3 py-2 rounded border hover:bg-gray-50">Home</Link>
          <Link href="/patient" className="px-3 py-2 rounded border hover:bg-gray-50">Patient</Link>
          <Link href={`/doctor/patients/${profile.patientId}/history`} className="px-3 py-2 rounded border hover:bg-gray-50">History</Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Appointments</div>
          <div className="text-2xl font-semibold">{loadingStats ? "-" : appointmentsCount}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Diagnoses</div>
          <div className="text-2xl font-semibold">{loadingStats ? "-" : diagnosesCount}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Prescriptions</div>
          <div className="text-2xl font-semibold">{loadingStats ? "-" : prescriptionsCount}</div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded border bg-white p-5">
        {!editing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Patient ID</div>
                <div className="font-mono text-sm">{profile.patientId}</div>
              </div>
              <button onClick={onEdit} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">
                Edit
              </button>
            </div>
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-gray-900">{profile.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-gray-900">{profile.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-gray-900">{profile.phone || "—"}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Age</div>
                <div className="text-gray-900">{profile.age ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Conditions</div>
                <div className="text-gray-900 whitespace-pre-wrap">{profile.conditions || "—"}</div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Patient ID</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={profile.patientId}
                  onChange={(e) => setProfile({ ...profile, patientId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Age</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded px-3 py-2"
                  value={profile.age ?? ""}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Conditions</label>
                <textarea
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  value={profile.conditions || ""}
                  onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
                  placeholder="e.g. Hypertension, Diabetes"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 rounded border bg-white text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Helpful Links */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/booking" className="px-3 py-2 rounded border hover:bg-gray-50">Book Appointment</Link>
        <Link href="/records" className="px-3 py-2 rounded border hover:bg-gray-50">Medical Records</Link>
      </div>
    </div>
  );
}
