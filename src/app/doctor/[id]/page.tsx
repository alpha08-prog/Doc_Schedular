import React from 'react';

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Doctor Profile</h1>
      <p className="text-gray-600 mt-2">Doctor ID: <span className="font-mono">{id}</span></p>
      {/* TODO: Render doctor-specific details here */}
    </div>
  );
}