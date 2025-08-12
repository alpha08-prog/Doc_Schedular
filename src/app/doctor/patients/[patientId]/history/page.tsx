"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DoctorNavbar from "../../../../components/doc_navbar";

type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type Diagnosis = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  notes?: string;
  date: string; // ISO
  createdAt: string;
  updatedAt: string;
};

type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  appointmentId: string;
  medicineName: string;
  dosage: string;
  duration: string;
  notes: string;
  prescriptionDate: string; // yyyy-mm-dd
  createdAt: string;
  updatedAt: string;
};

export default function MedicalHistoryPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params; // expected: patient-<id>

  // Mock patient header info (aligns with patients page mock data)
  const mockPatients: Record<string, { name: string; age: number; gender: string; condition?: string }> = {
    'patient-1': { name: 'Sarah Johnson', age: 34, gender: 'Female', condition: 'Hypertension' },
    'patient-2': { name: 'Michael Chen', age: 28, gender: 'Male', condition: 'Diabetes Type 2' },
    'patient-3': { name: 'Emily Rodriguez', age: 42, gender: 'Female', condition: 'Arthritis' },
    'patient-4': { name: 'David Wilson', age: 55, gender: 'Male', condition: 'Back Pain' },
    'patient-5': { name: 'Lisa Thompson', age: 31, gender: 'Female', condition: 'Migraine' },
    'patient-6': { name: 'Robert Garcia', age: 47, gender: 'Male', condition: 'High Cholesterol' },
  };

  const patientInfo = mockPatients[patientId];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Filters
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [aRes, dRes, pRes] = await Promise.all([
          fetch(`/api/appointments?patientId=${encodeURIComponent(patientId)}`),
          fetch(`/api/diagnoses?patientId=${encodeURIComponent(patientId)}`),
          fetch(`/api/prescriptions?patientId=${encodeURIComponent(patientId)}`),
        ]);
        const [aJson, dJson, pJson] = await Promise.all([aRes.json(), dRes.json(), pRes.json()]);
        if (!aJson.success || !dJson.success || !pJson.success) throw new Error("Failed to load data");
        setAppointments(aJson.data || []);
        setDiagnoses(dJson.data || []);
        setPrescriptions(pJson.data || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load medical history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  const inRange = (iso: string) => {
    if (!from && !to) return true;
    const t = new Date(iso).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to) {
      const end = new Date(to);
      // include entire end day
      end.setHours(23, 59, 59, 999);
      if (t > end.getTime()) return false;
    }
    return true;
  };

  const timeline = useMemo(() => {
    type Entry = { type: "appointment" | "diagnosis" | "prescription"; date: string; item: any };
    const items: Entry[] = [];

    appointments.forEach(a => items.push({ type: "appointment", date: a.date, item: a }));
    diagnoses.forEach(d => items.push({ type: "diagnosis", date: d.date, item: d }));
    prescriptions.forEach(p => items.push({ type: "prescription", date: p.prescriptionDate, item: p }));

    const filtered = items.filter(i => inRange(i.date));

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return filtered;
  }, [appointments, diagnoses, prescriptions, from, to]);

  const totalAppointments = useMemo(() => appointments.filter(a => inRange(a.date)).length, [appointments, from, to]);
  const totalPrescriptions = useMemo(() => prescriptions.filter(p => inRange(p.prescriptionDate)).length, [prescriptions, from, to]);

  const prettyDate = (isoOrYmd: string) => {
    const d = new Date(isoOrYmd);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    // handle yyyy-mm-dd from prescriptionDate
    try {
      const parts = isoOrYmd.split("-");
      const dd = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return dd.toLocaleDateString();
    } catch {
      return isoOrYmd;
    }
  };

  const downloadPDF = () => {
    // Simple approach: open print dialog. Users can choose "Save as PDF".
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DoctorNavbar />

      <div className="max-w-7xl mx-auto px-4 py-6 print:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Medical History
            </h1>
            <p className="text-gray-600 mt-1">Patient ID: <span className="font-mono">{patientId}</span></p>
            {patientInfo && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900">{patientInfo.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{patientInfo.age} yrs</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{patientInfo.gender}</span>
                {patientInfo.condition && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{patientInfo.condition}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Link href="/doctor/patients" className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Back to Patients</Link>
            <button onClick={downloadPDF} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Download PDF</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 mb-6 print:hidden">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <button onClick={() => { setFrom(""); setTo(""); }} className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Reset</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4">
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="text-2xl font-bold text-blue-600">{totalAppointments}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4">
            <p className="text-sm text-gray-600">Total Prescriptions</p>
            <p className="text-2xl font-bold text-green-600">{totalPrescriptions}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4">
            <p className="text-sm text-gray-600">Total Diagnoses</p>
            <p className="text-2xl font-bold text-purple-600">{diagnoses.filter(d => inRange(d.date)).length}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading medical history...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : timeline.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No records found for the selected date range.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {timeline.map((entry, idx) => (
                <li key={idx} className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      entry.type === 'appointment' ? 'bg-blue-100 text-blue-600' : entry.type === 'diagnosis' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {entry.type === 'appointment' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      )}
                      {entry.type === 'diagnosis' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/></svg>
                      )}
                      {entry.type === 'prescription' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6"/></svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 capitalize">{entry.type}</h3>
                        <span className="text-sm text-gray-500">{prettyDate(entry.date)}</span>
                      </div>
                      {entry.type === 'appointment' && (
                        <div className="mt-1 text-gray-700">
                          <p><span className="font-medium">Reason:</span> {entry.item.reason}</p>
                          {entry.item.notes && <p className="text-sm text-gray-600">{entry.item.notes}</p>}
                        </div>
                      )}
                      {entry.type === 'diagnosis' && (
                        <div className="mt-1 text-gray-700">
                          <p><span className="font-medium">Diagnosis:</span> {entry.item.diagnosis}</p>
                          {entry.item.notes && <p className="text-sm text-gray-600">{entry.item.notes}</p>}
                        </div>
                      )}
                      {entry.type === 'prescription' && (
                        <div className="mt-1 text-gray-700">
                          <p className="font-medium">{entry.item.medicineName}</p>
                          <p className="text-sm">{entry.item.dosage} • {entry.item.duration}</p>
                          {entry.item.notes && <p className="text-sm text-gray-600">{entry.item.notes}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
