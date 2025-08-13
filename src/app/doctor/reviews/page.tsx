"use client";
import React, { useEffect, useMemo, useState } from "react";
import StarRating from "../../components/StarRating";
import Link from "next/link";

 type Review = {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
};

type FetchResponse = {
  success: boolean;
  data: Review[];
  page: number;
  pageSize: number;
  total: number;
  average: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
};

export default function DoctorReviewsPage({ searchParams }: { searchParams: Record<string, string> }) {
  const doctorId = searchParams.doctorId || "1";
  const [page, setPage] = useState<number>(parseInt(searchParams.page || "1", 10));
  const [pageSize, setPageSize] = useState<number>(parseInt(searchParams.pageSize || "10", 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [distribution, setDistribution] = useState<{ [k: number]: number }>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [ratingMin, setRatingMin] = useState<number | ''>('');
  const [ratingMax, setRatingMax] = useState<number | ''>('');
  const [sort, setSort] = useState<'newest'|'oldest'|'highest'|'lowest'>('newest');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        doctorId: String(doctorId),
        page: String(page),
        pageSize: String(pageSize),
        sort,
      });
      if (ratingMin !== '') params.set('ratingMin', String(ratingMin));
      if (ratingMax !== '') params.set('ratingMax', String(ratingMax));
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const json: FetchResponse = await res.json();
      if (!json.success) throw new Error("Failed to fetch");
      setRows(json.data || []);
      setTotal(json.total || 0);
      setAverage(json.average || 0);
      setDistribution(json.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    } catch (e: any) {
      setError(e.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, page, pageSize, sort]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Patient Reviews</h1>
          <p className="text-gray-600 text-sm">Doctor ID: <span className="font-mono">{doctorId}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/doctor/dashboard" className="px-3 py-2 rounded border hover:bg-gray-50">Dashboard</Link>
          <Link href="/doctor/patients" className="px-3 py-2 rounded border hover:bg-gray-50">Patients</Link>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Average Rating</div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={Math.round(average)} readOnly />
            <span className="text-lg font-semibold">{average.toFixed(2)}</span>
          </div>
        </div>
        <div className="p-4 rounded border bg-white md:col-span-2">
          <div className="text-sm text-gray-500 mb-2">Rating Distribution</div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((r) => (
              <div key={r} className="flex items-center gap-3">
                <div className="w-10 text-sm">{r}★</div>
                <div className="flex-1 h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 rounded bg-yellow-400"
                    style={{ width: `${distribution[r] || 0}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-600">{distribution[r] || 0}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">Total Reviews: <span className="font-semibold text-gray-900">{total}</span></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Min</label>
            <select
              value={ratingMin}
              onChange={(e) => setRatingMin(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Any</option>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Max</label>
            <select
              value={ratingMax}
              onChange={(e) => setRatingMax(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Any</option>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest</option>
              <option value="lowest">Lowest</option>
            </select>
          </div>
          <button
            onClick={() => { setPage(1); load(); }}
            className="px-2.5 py-1.5 rounded border bg-white text-sm"
          >
            Apply
          </button>
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
              className="border rounded px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map(ps => <option key={ps} value={ps}>{ps}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded border bg-white divide-y">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-gray-600">No reviews yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} readOnly />
                  <span className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-800 mt-1">
                  {r.comment || <span className="italic text-gray-500">No comment</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">Patient: {r.patientName || r.patientId} · Appointment: <span className="font-mono">{r.appointmentId}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/doctor/patients/${r.patientId}/history`} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700">Medical History</Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded border bg-white disabled:opacity-50"
        >
          Previous
        </button>
        <div className="text-sm text-gray-700">Page {page} of {totalPages}</div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded border bg-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
