'use client';

import { useState, useEffect } from 'react';
import { Prescription } from '../api/prescriptions/route';

interface PrescriptionListProps {
  doctorId: string;
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescriptionId: string) => void;
  refreshTrigger?: number;
}

export default function PrescriptionList({
  doctorId,
  onEdit,
  onDelete,
  refreshTrigger = 0
}: PrescriptionListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'patient' | 'appointment' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPrescriptions();
  }, [doctorId, refreshTrigger]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        doctorId,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/prescriptions?${params}`);
      const data = await response.json();

      if (data.success) {
        setPrescriptions(data.data);
      } else {
        setError(data.error || 'Failed to fetch prescriptions');
      }
    } catch (err) {
      setError('Failed to fetch prescriptions');
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrescriptions();
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onDelete(prescriptionId);
        fetchPrescriptions(); // Refresh the list
      } else {
        alert(data.error || 'Failed to delete prescription');
      }
    } catch (err) {
      console.error('Error deleting prescription:', err);
      alert('Failed to delete prescription');
    }
  };

  const groupPrescriptions = (prescriptions: Prescription[]) => {
    const sorted = [...prescriptions].sort((a, b) => {
      const dateA = new Date(a.prescriptionDate).getTime();
      const dateB = new Date(b.prescriptionDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    if (groupBy === 'patient') {
      return sorted.reduce((groups, prescription) => {
        const key = prescription.patientName;
        if (!groups[key]) groups[key] = [];
        groups[key].push(prescription);
        return groups;
      }, {} as Record<string, Prescription[]>);
    } else if (groupBy === 'appointment') {
      return sorted.reduce((groups, prescription) => {
        const key = prescription.appointmentId || 'No Appointment';
        if (!groups[key]) groups[key] = [];
        groups[key].push(prescription);
        return groups;
      }, {} as Record<string, Prescription[]>);
    } else {
      return sorted.reduce((groups, prescription) => {
        const key = new Date(prescription.prescriptionDate).toLocaleDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(prescription);
        return groups;
      }, {} as Record<string, Prescription[]>);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading prescriptions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchPrescriptions}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const groupedPrescriptions = groupPrescriptions(prescriptions);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Prescriptions</h2>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by medicine, patient, or notes..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex gap-2">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'patient' | 'appointment' | 'date')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Group by Date</option>
              <option value="patient">Group by Patient</option>
              <option value="appointment">Group by Appointment</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {searchTerm && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">
              Showing results for: <strong>{searchTerm}</strong>
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                fetchPrescriptions();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No prescriptions found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPrescriptions).map(([groupKey, groupPrescriptions]) => (
            <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  {groupBy === 'patient' ? `Patient: ${groupKey}` :
                   groupBy === 'appointment' ? `Appointment: ${groupKey}` :
                   `Date: ${groupKey}`}
                  <span className="ml-2 text-sm text-gray-600">
                    ({groupPrescriptions.length} prescription{groupPrescriptions.length !== 1 ? 's' : ''})
                  </span>
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {groupPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg text-gray-800">
                            {prescription.medicineName}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {prescription.dosage}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {prescription.duration}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div><strong>Patient:</strong> {prescription.patientName}</div>
                          <div><strong>Date:</strong> {formatDate(prescription.prescriptionDate)}</div>
                          {prescription.appointmentId && (
                            <div><strong>Appointment:</strong> {prescription.appointmentId}</div>
                          )}
                        </div>

                        {prescription.notes && (
                          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <strong>Notes:</strong> {prescription.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => onEdit(prescription)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prescription.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                        {prescription.patientId && (
                          <a
                            href={`/doctor/patients/${prescription.patientId}/history`}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                            title="View Medical History"
                          >
                            Medical History
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
