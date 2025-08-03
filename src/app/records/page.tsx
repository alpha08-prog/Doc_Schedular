"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Mock medical records data
const mockRecords = [
  {
    id: 1,
    date: "2024-01-15",
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    diagnosis: "Routine Checkup",
    prescription: "Continue current medication",
    notes: "Blood pressure normal, heart rate stable",
    type: "checkup"
  },
  {
    id: 2,
    date: "2024-01-08",
    doctor: "Dr. Michael Chen",
    specialty: "Dermatologist",
    diagnosis: "Skin Consultation",
    prescription: "Topical cream prescribed",
    notes: "Minor skin irritation, should resolve in 1-2 weeks",
    type: "consultation"
  },
  {
    id: 3,
    date: "2023-12-20",
    doctor: "Dr. Emily Rodriguez",
    specialty: "Pediatrician",
    diagnosis: "Annual Physical",
    prescription: "Vitamin D supplements",
    notes: "Overall health excellent, continue regular exercise",
    type: "physical"
  }
];

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState(mockRecords);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checkup':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'consultation':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'physical':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Medical Records</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">Your medical records will appear here</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {records.length} record{records.length !== 1 ? 's' : ''}
                </h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Download All
                </button>
              </div>

              {records.map((record) => (
                <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(record.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.diagnosis}</h3>
                        <p className="text-sm text-gray-600">{record.doctor} • {record.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {record.prescription && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Prescription</h4>
                        <p className="text-sm text-gray-600">{record.prescription}</p>
                      </div>
                    )}
                    
                    {record.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{record.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                      View Details
                    </button>
                    <button className="text-gray-500 text-sm hover:text-gray-700">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
