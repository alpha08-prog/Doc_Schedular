"use client";

import { useState, useEffect } from "react";

interface Patient {
  id: string;
  name: string;
}

interface PatientSelectorProps {
  selectedPatientId: string;
  selectedPatientName: string;
  onPatientSelect: (patientId: string, patientName: string) => void;
  disabled?: boolean;
}

export default function PatientSelector({
  selectedPatientId,
  onPatientSelect,
  disabled = false,
}: PatientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // The doctor's patients, derived from their appointment history.
  useEffect(() => {
    let active = true;
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((j) => {
        if (!active || !j.success) return;
        const map = new Map<string, Patient>();
        for (const a of j.data as Array<{ patientId: string; patientName?: string }>) {
          if (a.patientId && !map.has(a.patientId)) {
            map.set(a.patientId, { id: a.patientId, name: a.patientName ?? a.patientId });
          }
        }
        setPatients(Array.from(map.values()));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient.id, patient.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient *</label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "hover:border-gray-400"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            {selectedPatient ? (
              <div className="font-medium text-gray-900">{selectedPatient.name}</div>
            ) : (
              <span className="text-gray-500">Select a patient...</span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-gray-500 text-center">Loading patients...</div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handlePatientSelect(patient)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                    selectedPatientId === patient.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{patient.name}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No patients yet. Patients appear here once they book an appointment with you.
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
