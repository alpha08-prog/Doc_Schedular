"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmptyAppointments from "../components/appointment/EmptyAppointments";
import TopBar from "../components/common/TopBar";
import Tabs from "../components/common/Tabs";
import CardContainer from "../components/common/CardContainer";
import IconButton from "../components/common/IconButton";

// Mock appointment data
const mockAppointments = {
  upcoming: [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2024-08-05",
      time: "10:00 AM",
      status: "confirmed",
      avatar: "/api/placeholder/60/60"
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialty: "Dermatologist",
      date: "2024-08-07",
      time: "2:30 PM",
      status: "pending",
      avatar: "/api/placeholder/60/60"
    }
  ],
  completed: [
    {
      id: 3,
      doctorName: "Dr. Emily Davis",
      specialty: "General Physician",
      date: "2024-07-28",
      time: "9:00 AM",
      status: "completed",
      avatar: "/api/placeholder/60/60"
    }
  ],
  canceled: [
    {
      id: 4,
      doctorName: "Dr. Robert Wilson",
      specialty: "Orthopedic",
      date: "2024-07-25",
      time: "11:30 AM",
      status: "canceled",
      avatar: "/api/placeholder/60/60"
    }
  ]
};

interface Appointment {
  id: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  avatar: string;
}

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'canceled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="card-interactive mb-4 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Doctor Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        {/* Appointment Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{appointment.doctorName}</h3>
              <p className="text-sm text-blue-600 truncate">{appointment.specialty}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(appointment.date)}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {appointment.time}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex items-center gap-2">
          {appointment.status === 'upcoming' && (
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BookingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const tabData = [
    { label: "Upcoming", count: mockAppointments.upcoming.length, data: mockAppointments.upcoming },
    { label: "Completed", count: mockAppointments.completed.length, data: mockAppointments.completed },
    { label: "Canceled", count: mockAppointments.canceled.length, data: mockAppointments.canceled }
  ];
  
  const currentAppointments = tabData[activeTab].data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-24">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className={`text-center mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments</p>
        </div>
        
        {/* Quick Actions */}
        <div className={`grid grid-cols-3 gap-4 mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <button 
            onClick={() => router.push('/doctors')}
            className="card-interactive text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Find Doctor</h3>
            <p className="text-sm text-gray-600">Search for specialists</p>
          </button>
          
          <button 
            onClick={() => router.push('/doctors')}
            className="card-interactive text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Schedule</h3>
            <p className="text-sm text-gray-600">Book new appointment</p>
          </button>
          
          <button 
            onClick={() => router.push('/records')}
            className="card-interactive text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Records</h3>
            <p className="text-sm text-gray-600">View medical history</p>
          </button>
        </div>
        
        {/* Tabs */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${mounted ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="border-b border-gray-100">
            <nav className="flex">
              {tabData.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 relative ${
                    activeTab === index
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs rounded-full ${
                        activeTab === index
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </span>
                  {activeTab === index && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 animate-scale-in" />
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {currentAppointments.length > 0 ? (
              <div className="space-y-4">
                {currentAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <EmptyAppointments onBook={() => router.push("/")} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}