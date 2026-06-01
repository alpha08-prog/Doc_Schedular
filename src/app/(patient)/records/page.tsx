"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDate } from "@/lib/utils";
import type { Diagnosis } from "@/types/diagnosis";
import type { ApiResponse } from "@/types/api";
import Prescriptions from "./Prescriptions";

type TabKey = "records" | "prescriptions";

const RecordIcon = (
  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

function RecordsListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading records">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} padding="md">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9" circle />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton lines={2} />
        </Card>
      ))}
    </div>
  );
}

export default function RecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();
  const patientId = user?.id ?? "patient-1";

  const [tab, setTab] = useState<TabKey>("records");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDiagnoses() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<ApiResponse<Diagnosis[]>>(
          `/api/diagnoses?patientId=${encodeURIComponent(patientId)}`
        );
        if (!active) return;
        if (res.success) {
          setDiagnoses(res.data);
        } else {
          throw new ApiError(500, res.error);
        }
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof ApiError ? err.message : "Unable to load records. Please try again.";
        setError(message);
        notify(message, "error");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDiagnoses();
    return () => {
      active = false;
    };
  }, [patientId, notify]);

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
            <h1 className="text-xl font-bold text-gray-900">Medical Records</h1>
            <div className="w-16" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6" role="tablist" aria-label="Medical record types">
          <button
            role="tab"
            aria-selected={tab === "records"}
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              tab === "records"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-gray-500 bg-gray-100 hover:text-blue-600"
            }`}
            onClick={() => setTab("records")}
          >
            Records
          </button>
          <button
            role="tab"
            aria-selected={tab === "prescriptions"}
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              tab === "prescriptions"
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-gray-500 bg-gray-100 hover:text-blue-600"
            }`}
            onClick={() => setTab("prescriptions")}
          >
            Prescriptions
          </button>
        </div>

        {/* Records (diagnoses) tab */}
        {tab === "records" ? (
          loading ? (
            <RecordsListSkeleton />
          ) : error ? (
            <EmptyState
              title="Something went wrong"
              description={error}
              action={{ label: "Retry", onClick: () => router.refresh() }}
            />
          ) : diagnoses.length === 0 ? (
            <EmptyState
              title="No records found"
              description="Your diagnoses and visit records will appear here."
              icon={RecordIcon}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {diagnoses.length} record{diagnoses.length !== 1 ? "s" : ""}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  Download All
                </Button>
              </div>

              {diagnoses.map((record) => (
                <Card key={record.id} padding="md">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0">{RecordIcon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.diagnosis}</h3>
                        <p className="text-sm text-gray-600">Doctor ID: {record.doctorId}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatDate(record.date)}
                    </p>
                  </div>

                  {record.notes && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                    <Button variant="ghost" size="sm" onClick={() => {}}>
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Prescriptions tab — existing component handles its own fetch/loading/empty states */
          <Prescriptions patientId={patientId} />
        )}
      </div>
    </div>
  );
}
