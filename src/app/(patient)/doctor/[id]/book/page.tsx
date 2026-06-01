"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import doctors from "@/data/doctors.json";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

function parseTimeString(timeStr: string): Date {
  timeStr = timeStr.replace(/–|—/g, "-").replace(/\s+/g, " ").trim();
  const parts = timeStr.split(" ");
  const time = parts[0];
  const modifier = parts[1] || "";
  const [hoursStr, minutesStr] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? parseInt(minutesStr, 10) : 0;
  if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

function generateTimeSlots(
  startStr: string,
  endStr: string
): { time: string; disabled: boolean }[] {
  const slots: { time: string; disabled: boolean }[] = [];
  const start = parseTimeString(startStr);
  const end = parseTimeString(endStr);
  const afternoonStart = parseTimeString("12:30 PM");
  const eveningStart = parseTimeString("4:00 PM");
  while (start < end) {
    const slotStart = new Date(start);
    start.setMinutes(start.getMinutes() + 15);
    if (start > end) break;
    if (slotStart >= afternoonStart && slotStart < eveningStart) continue;
    const format = (d: Date) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    slots.push({ time: `${format(slotStart)} – ${format(start)}`, disabled: false });
  }
  return slots;
}

function getNextDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d.getDate(),
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase().slice(0, 3),
      fullDate: d,
    };
  });
}

export default function BookSlotPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id =
    typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const doctor = doctors.find((doc) => String(doc.id) === String(id));

  const days = useMemo(() => getNextDays(5), []);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Doctor not found.</div>
      </div>
    );
  }

  let start = "09:00 AM",
    end = "05:00 PM";
  if (doctor.time) {
    if (doctor.time.includes("to")) {
      [start, end] = doctor.time.split("to").map((s) => s.replace(/[–-]/g, "").trim());
    } else if (doctor.time.includes("–") || doctor.time.includes("-")) {
      [start, end] = doctor.time.split(/[–-]/).map((s) => s.trim());
    }
  }
  const slots = generateTimeSlots(start, end);

  const morningAfternoonSlots: { time: string; disabled: boolean }[] = [];
  const eveningSlots: { time: string; disabled: boolean }[] = [];
  slots.forEach((slot) => {
    const slotStart = parseTimeString(slot.time.split("–")[0].trim());
    if (slotStart.getHours() >= 16) eveningSlots.push(slot);
    else morningAfternoonSlots.push(slot);
  });

  const selectedFullDate = days[selectedDay]?.fullDate ?? new Date();
  const monthYear = selectedFullDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const slotBtnClass = (active: boolean, disabled: boolean) =>
    `px-3 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 ${
      disabled
        ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
        : active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50"
    }`;

  return (
    <div className="min-h-screen bg-white pb-24 flex justify-center">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-white sm:rounded-3xl sm:shadow-lg sm:my-6">
        {/* Header */}
        <div className="relative bg-blue-600 h-24 rounded-b-3xl flex items-center px-4 sm:rounded-t-3xl sm:rounded-b-none">
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="mx-auto text-white text-lg font-semibold">Book Appointment</h1>
        </div>

        <div className="px-4 pt-8 sm:px-8 sm:pt-10 md:px-16 md:pt-12 lg:px-24 lg:pt-16">
          {/* Doctor Card */}
          <div className="bg-white rounded-2xl shadow-lg flex items-center p-4 pr-6 mb-6">
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold text-gray-900 leading-tight mb-0.5 sm:text-2xl">
                {doctor.name}
              </div>
              <div className="text-base text-gray-400 font-semibold leading-tight mb-0.5 sm:text-lg">
                {doctor.specialty}
              </div>
              <span className="inline-block bg-green-100 text-green-600 text-xs font-semibold rounded-lg px-2 py-0.5 mb-1">
                {doctor.status}
              </span>
              <div className="text-xs text-gray-500 truncate mb-2">{doctor.bio}</div>
              <div className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg px-3 py-1">
                {doctor.time}
              </div>
            </div>
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-xl object-cover ml-4 border-2 border-gray-100 sm:w-24 sm:h-24"
            />
          </div>

          {/* Date Picker */}
          <div className="font-bold text-lg text-gray-900 mb-2 sm:text-xl">Book Appointment</div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 text-base">{monthYear}</span>
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedDay(i);
                  setSelectedSlot(null);
                }}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border text-center min-w-[70px] font-semibold transition-all duration-150 ${
                  selectedDay === i
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-400 border-gray-200"
                }`}
              >
                <span className="text-lg">{d.date}</span>
                <span className="text-xs mt-1">{d.day}</span>
              </button>
            ))}
          </div>

          {/* Morning / Afternoon Slots */}
          {morningAfternoonSlots.length > 0 && (
            <>
              <div className="font-bold text-base text-gray-900 mb-2">Select slot</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {morningAfternoonSlots.map((slot, idx) => (
                  <button
                    key={slot.time + idx}
                    disabled={slot.disabled}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={slotBtnClass(selectedSlot === slot.time, slot.disabled)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Evening Slots */}
          {eveningSlots.length > 0 && (
            <>
              <div className="font-bold text-base text-gray-900 mb-2">Evening Slot</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {eveningSlots.map((slot, idx) => (
                  <button
                    key={slot.time + idx}
                    disabled={slot.disabled}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={slotBtnClass(selectedSlot === slot.time, slot.disabled)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Book Button */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 bg-white pt-4 sm:static sm:px-8 sm:pb-8 sm:pt-8 md:px-16 md:pb-10 md:pt-10 lg:px-24 lg:pb-12 lg:pt-12">
          <button
            className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl text-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!selectedSlot || bookingLoading}
            onClick={async () => {
              if (!selectedSlot) return;
              setBookingLoading(true);
              setBookingError(null);
              try {
                const res = await fetch("/api/booking", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    doctorId: doctor.id,
                    userId: user?.id ?? "patient-1",
                    timeslot: selectedSlot,
                    date: selectedFullDate.toISOString(),
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  router.push(`/doctor/${id}/success`);
                } else {
                  setBookingError(data.error || "Booking failed. Please try again.");
                }
              } catch {
                setBookingError("Booking failed. Please check your connection.");
              } finally {
                setBookingLoading(false);
              }
            }}
          >
            {bookingLoading ? "Booking..." : "Book appointment"}
          </button>
          {bookingError && (
            <div className="text-red-500 text-sm mt-2 text-center">{bookingError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
