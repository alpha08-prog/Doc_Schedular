'use client';
import React, { useState, useEffect } from "react";
import DoctorNavbar from "../../components/doc_navbar";

// Type definitions
interface Appointment {
  id: number;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason: string;
  notes: string;
}

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    patientAge: 34,
    patientPhone: "+1 (555) 123-4567",
    date: "2024-01-16",
    time: "10:00 AM",
    duration: "30 min",
    type: "Consultation",
    status: "confirmed",
    reason: "Regular checkup",
    notes: "Patient reports feeling well"
  },
  {
    id: 2,
    patientName: "Michael Chen",
    patientAge: 28,
    patientPhone: "+1 (555) 234-5678",
    date: "2024-01-16",
    time: "11:30 AM",
    duration: "45 min",
    type: "Follow-up",
    status: "confirmed",
    reason: "Blood pressure monitoring",
    notes: "Follow-up on medication adjustment"
  },
  {
    id: 3,
    patientName: "Emily Rodriguez",
    patientAge: 42,
    patientPhone: "+1 (555) 345-6789",
    date: "2024-01-16",
    time: "2:00 PM",
    duration: "30 min",
    type: "Check-up",
    status: "pending",
    reason: "Annual physical examination",
    notes: "First visit to the clinic"
  },
  {
    id: 4,
    patientName: "David Wilson",
    patientAge: 55,
    patientPhone: "+1 (555) 456-7890",
    date: "2024-01-16",
    time: "3:30 PM",
    duration: "60 min",
    type: "Treatment",
    status: "confirmed",
    reason: "Physical therapy session",
    notes: "Ongoing treatment for back pain"
  },
  {
    id: 5,
    patientName: "Lisa Thompson",
    patientAge: 31,
    patientPhone: "+1 (555) 567-8901",
    date: "2024-01-17",
    time: "9:00 AM",
    duration: "30 min",
    type: "Consultation",
    status: "pending",
    reason: "Headache concerns",
    notes: "Recurring headaches for past month"
  },
  {
    id: 6,
    patientName: "Robert Garcia",
    patientAge: 47,
    patientPhone: "+1 (555) 678-9012",
    date: "2024-01-17",
    time: "10:30 AM",
    duration: "30 min",
    type: "Follow-up",
    status: "cancelled",
    reason: "Diabetes management",
    notes: "Patient requested to reschedule"
  }
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800"
};

const typeColors: Record<string, string> = {
  "Consultation": "bg-blue-50 text-blue-700",
  "Follow-up": "bg-green-50 text-green-700",
  "Check-up": "bg-purple-50 text-purple-700",
  "Treatment": "bg-orange-50 text-orange-700"
};

// Map mock patient names to their numeric IDs used in patients page
const patientNameToId: Record<string, number> = {
  "Sarah Johnson": 1,
  "Michael Chen": 2,
  "Emily Rodriguez": 3,
  "David Wilson": 4,
  "Lisa Thompson": 5,
  "Robert Garcia": 6,
};

const getPatientSlug = (name: string) => {
  const id = patientNameToId[name];
  return id ? `patient-${id}` : null;
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedTab, setSelectedTab] = useState<string>("today");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus as Appointment['status'] } : apt
      )
    );
  };

  const getFilteredAppointments = () => {
    switch (selectedTab) {
      case "today":
        return appointments.filter(apt => apt.date === "2024-01-16"); // Mock today
      case "upcoming":
        return appointments.filter(apt => apt.date > "2024-01-16");
      case "pending":
        return appointments.filter(apt => apt.status === "pending");
      case "all":
        return appointments;
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DoctorNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Appointments Management
          </h1>
          <p className="text-gray-600">Manage your patient appointments and schedule</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{`Today's Total`}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appointments.filter(apt => apt.date === "2024-01-16").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === "confirmed").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status === "pending").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {appointments.filter(apt => apt.status === "cancelled").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-2">
            <div className="flex space-x-2">
              {[
                { key: "today", label: "Today", count: appointments.filter(apt => apt.date === "2024-01-16").length },
                { key: "upcoming", label: "Upcoming", count: appointments.filter(apt => apt.date > "2024-01-16").length },
                { key: "pending", label: "Pending", count: appointments.filter(apt => apt.status === "pending").length },
                { key: "all", label: "All", count: appointments.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedTab === tab.key
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">No appointments match the selected criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                            statusColors[appointment.status]
                          }`}>
                            {getStatusIcon(appointment.status)}
                            <span className="capitalize">{appointment.status}</span>
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            typeColors[appointment.type]
                          }`}>
                            {appointment.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{appointment.time} ({appointment.duration})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{appointment.patientPhone}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {appointment.reason}</p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Notes:</span> {appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {getPatientSlug(appointment.patientName) && (
                        <a
                          href={`/doctor/patients/${getPatientSlug(appointment.patientName)}/history`}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                          title="View Medical History"
                        >
                          Medical History
                        </a>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}