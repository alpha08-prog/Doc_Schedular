"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string | null;
  status?: string | null;
  bio?: string | null;
  about?: string | null;
  time?: string | null;
  degrees?: string | null;
  fellow?: string | null;
  tags?: string[];
  availability?: string[];
  rating?: number | null;
  experience?: string | null;
  fee?: number | null;
}

interface Review {
  id: string;
  patientName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [dRes, rRes] = await Promise.all([
          fetch(`/api/doctors/${id}`),
          fetch(`/api/reviews?doctorId=${encodeURIComponent(id)}&pageSize=20&sort=newest`),
        ]);
        const dJson = await dRes.json();
        if (!active) return;
        if (!dRes.ok || !dJson.success) {
          setNotFound(true);
        } else {
          setDoctor(dJson.data as Doctor);
        }
        const rJson = await rRes.json().catch(() => ({}));
        if (active && rJson.success) {
          setReviews(rJson.data ?? []);
          setAverage(rJson.average ?? 0);
          setTotal(rJson.total ?? 0);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Doctor not found</h1>
        <Link href="/doctors" className="text-blue-600 hover:underline mt-3 inline-block">
          Back to doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <Card padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <Image
              src={doctor.image || "/images/doctor-placeholder.jpg"}
              alt={doctor.name}
              width={120}
              height={120}
              className="w-28 h-28 rounded-2xl object-cover border border-gray-100"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
            {doctor.degrees && <p className="text-sm text-gray-500 mt-0.5">{doctor.degrees}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {(doctor.rating ?? average) > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating value={Math.round(doctor.rating ?? average)} readonly />
                  <span className="text-sm font-medium text-gray-700">
                    {(doctor.rating ?? average).toFixed(1)}
                  </span>
                </div>
              )}
              {doctor.experience && (
                <span className="text-sm text-gray-500">{doctor.experience} experience</span>
              )}
              {doctor.status && <Badge variant="success">{doctor.status}</Badge>}
            </div>
          </div>
        </div>

        {(doctor.about || doctor.bio) && (
          <p className="text-gray-700 mt-6 leading-relaxed">{doctor.about || doctor.bio}</p>
        )}

        {doctor.tags && doctor.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {doctor.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {doctor.availability && doctor.availability.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Availability</h2>
            <ul className="space-y-1">
              {doctor.availability.map((a) => (
                <li key={a} className="text-sm text-gray-600">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Patient Reviews {total > 0 && <span className="text-gray-500">({total})</span>}
          </h2>
          {average > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating value={Math.round(average)} readonly />
              <span className="text-sm font-medium text-gray-700">{average.toFixed(1)}</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} readonly />
                  <span className="text-sm font-medium text-gray-800">
                    {r.patientName || "Patient"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Book CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 sm:static sm:border-0 sm:px-0 sm:mt-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {doctor.fee != null && (
            <div className="text-sm text-gray-600">
              Consultation fee: <span className="font-semibold text-gray-900">₹{doctor.fee}</span>
            </div>
          )}
          <Link
            href={`/doctor/${doctor.id}/book`}
            className="ml-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
