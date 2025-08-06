'use client';

import { useState, useCallback } from 'react';
import DoctorNavbar from '../../components/doc_navbar';
import PrescriptionForm from '../../components/PrescriptionForm';
import PrescriptionList from '../../components/PrescriptionList';
import { Prescription } from '../../api/prescriptions/route';

export default function PrescriptionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mock doctor ID - in a real app, this would come from authentication
  const doctorId = '1';

  const handleCreateNew = () => {
    setEditingPrescription(null);
    setShowForm(true);
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setRefreshTrigger(prev => prev + 1);
        alert('Prescription deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (prescriptionData: Partial<Prescription>) => {
    try {
      setIsLoading(true);
      
      const url = editingPrescription 
        ? `/api/prescriptions/${editingPrescription.id}`
        : '/api/prescriptions';
      
      const method = editingPrescription ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...prescriptionData,
          doctorId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingPrescription(null);
        setRefreshTrigger(prev => prev + 1); // This triggers PrescriptionList to refetch
        // Optionally, scroll to the list section
        setTimeout(() => {
          const el = document.getElementById('prescription-list-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        alert(editingPrescription ? 'Prescription updated successfully!' : 'Prescription created successfully!');
      } else {
        alert(data.error || 'Failed to save prescription');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPrescription(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DoctorNavbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Prescription Management
              </h1>
              <p className="text-gray-600 mt-1">Create, view, and manage patient prescriptions</p>
            </div>
            <button
              onClick={handleCreateNew}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Prescription
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {showForm ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {editingPrescription ? 'Update prescription details' : 'Fill in the prescription details below'}
                </p>
              </div>
              
              <PrescriptionForm
                doctorId={doctorId}
                prescription={editingPrescription || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div id="prescription-list-section" className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Prescriptions</h2>
                <p className="text-gray-600 mt-1">View and manage all patient prescriptions</p>
              </div>
              
              <PrescriptionList
                doctorId={doctorId}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!showForm && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-blue-600">--</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">--</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-purple-600">--</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
