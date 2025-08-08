"use client";
import React, { useEffect, useState } from "react";

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  appointmentId: string;
  medicineName: string;
  dosage: string;
  duration: string;
  notes: string;
  prescriptionDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  patientId: string;
}

const Prescriptions: React.FC<Props> = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/prescriptions?patientId=${patientId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch prescriptions");
        return res.json();
      })
      .then((data) => {
        setPrescriptions(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [patientId]);

  if (!patientId) return null;

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Loading prescriptions...</div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">{error}</div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">No prescriptions found.</div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((rx) => (
        <div key={rx.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{rx.medicineName}</h3>
              <p className="text-sm text-gray-600">Prescribed by: {rx.doctorId} | Date: {new Date(rx.prescriptionDate).toLocaleDateString()}</p>
            </div>
            <span className="text-xs text-gray-400">{rx.duration}</span>
          </div>
          <div className="text-sm text-gray-700 mb-1">Dosage: <span className="font-medium">{rx.dosage}</span></div>
          {rx.notes && <div className="text-sm text-gray-600 mb-1">Notes: {rx.notes}</div>}
        </div>
      ))}
    </div>
  );
};

export default Prescriptions;
