"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DoctorCard from "@/app/components/DoctorCard";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { apiClient, ApiError } from "@/lib/api-client";
import { useNotification } from "@/contexts/NotificationContext";
import type { Doctor } from "@/types/doctor";

const ALL_SPECIALTIES = "All Specialties";

const SearchIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export default function DoctorsPage() {
  const router = useRouter();
  const { notify } = useNotification();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(ALL_SPECIALTIES);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      setLoading(true);
      setError(null);
      try {
        // GET /api/doctors returns a raw Doctor[] array (not wrapped in { success, data })
        const data = await apiClient.get<Doctor[]>("/api/doctors");
        if (!active) return;
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof ApiError ? err.message : "Unable to load doctors. Please try again.";
        setError(message);
        notify(message, "error");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDoctors();
    return () => {
      active = false;
    };
  }, [notify]);

  // Derive unique specialties from the fetched doctors
  const specialties = useMemo(() => {
    const unique = Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b)
    );
    return [ALL_SPECIALTIES, ...unique];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesSpecialty =
        selectedSpecialty === ALL_SPECIALTIES || doctor.specialty === selectedSpecialty;
      const matchesQuery =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query);
      return matchesSpecialty && matchesQuery;
    });
  }, [doctors, selectedSpecialty, searchQuery]);

  const handleDoctorSelect = (doctor: Doctor) => {
    router.push(`/doctor/${doctor.id}/book`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Find a Doctor</h1>
            <div className="w-16" aria-hidden="true" />
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search doctors or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftAddon={SearchIcon}
              aria-label="Search doctors or specialties"
            />
          </div>

          {/* Specialty Filter Chips */}
          {!loading && specialties.length > 1 && (
            <div
              className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1"
              role="group"
              aria-label="Filter by specialty"
            >
              {specialties.map((specialty) => {
                const isActive = selectedSpecialty === specialty;
                return (
                  <button
                    key={specialty}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-gray-600 border border-gray-300 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {specialty}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4" aria-busy="true" aria-label="Loading doctors">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Something went wrong"
            description={error}
            action={{
              label: "Retry",
              onClick: () => router.refresh(),
            }}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3l-6.93-12a2 2 0 00-3.48 0l-6.93 12a2 2 0 001.74 3z"
                />
              </svg>
            }
          />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description="Try adjusting your search or filter criteria."
            action={
              searchQuery || selectedSpecialty !== ALL_SPECIALTIES
                ? {
                    label: "Clear filters",
                    variant: "secondary",
                    onClick: () => {
                      setSearchQuery("");
                      setSelectedSpecialty(ALL_SPECIALTIES);
                    },
                  }
                : undefined
            }
            icon={SearchIcon}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available
              </h2>
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
