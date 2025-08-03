"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorCard from "../components/DoctorCard";

// Doctor type definition
export type Doctor = {
  id: number | string;
  name: string;
  specialty: string;
  image: string;
  status: string;
  bio: string;
  time: string;
  rating?: number;
  experience?: string;
};

// Mock doctors data - replace with API call
const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: "/images/doctor1.jpg",
    status: "Available",
    bio: "Specialized in heart diseases and cardiovascular health",
    time: "Available today",
    rating: 4.8,
    experience: "10+ years"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatologist",
    image: "/images/doctor2.jpg",
    status: "Available",
    bio: "Expert in skin conditions and cosmetic dermatology",
    time: "Next available: 2:00 PM",
    rating: 4.9,
    experience: "8+ years"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrician",
    image: "/images/doctor3.jpg",
    status: "Available",
    bio: "Caring for children's health and development",
    time: "Available tomorrow",
    rating: 4.7,
    experience: "12+ years"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedic",
    image: "/images/doctor4.jpg",
    status: "Busy",
    bio: "Specialist in bone and joint disorders",
    time: "Next available: Tomorrow 10:00 AM",
    rating: 4.6,
    experience: "15+ years"
  },
  {
    id: 5,
    name: "Dr. Lisa Thompson",
    specialty: "Neurologist",
    image: "/images/doctor5.jpg",
    status: "Available",
    bio: "Expert in brain and nervous system disorders",
    time: "Available today",
    rating: 4.9,
    experience: "14+ years"
  },
  {
    id: 6,
    name: "Dr. David Kumar",
    specialty: "General Practice",
    image: "/images/doctor2.jpg",
    status: "Available",
    bio: "Comprehensive primary healthcare services",
    time: "Available now",
    rating: 4.5,
    experience: "7+ years"
  }
];

const specialties = [
  "All Specialties",
  "Cardiologist",
  "Dermatologist", 
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "General Practice",
  "Psychiatry",
  "Gynecology"
];

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // In a real app, this would be an API call
    // fetch('/api/doctors').then(res => res.json()).then(data => setDoctors(data));
    setDoctors(mockDoctors);
    setFilteredDoctors(mockDoctors);
  }, []);

  useEffect(() => {
    let filtered = doctors;

    // Filter by specialty
    if (selectedSpecialty !== "All Specialties") {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, selectedSpecialty, searchQuery]);

  const handleDoctorSelect = (doctor: Doctor) => {
    // Navigate to booking page with doctor ID
    router.push(`/doctor/${doctor.id}/book`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">Find a Doctor</h1>
            <div className="w-16"></div> {/* Spacer for center alignment */}
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search doctors or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Specialty Filter */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSpecialty === specialty
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Sort by rating
              </button>
            </div>
            
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                name={doctor.name}
                specialty={doctor.specialty}
                image={doctor.image}
                status={doctor.status}
                bio={doctor.bio}
                time={doctor.time}
                rating={doctor.rating}
                experience={doctor.experience}
                onClick={() => handleDoctorSelect(doctor)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
