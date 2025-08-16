'use client';

import { useState } from 'react';
import DoctorNavbar from '../../components/doc_navbar';
import PrescriptionForm from '../../components/PrescriptionForm';
import PrescriptionList from '../../components/PrescriptionList';
import NotificationToast from '../../components/NotificationToast';
import { Prescription } from '../../../types/prescription';

export default function PrescriptionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
        setNotification({ message: 'Prescription deleted successfully!', type: 'success' });
      } else {
        setNotification({ message: data.error || 'Failed to delete prescription', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      setNotification({ message: 'Failed to delete prescription', type: 'error' });
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
        setRefreshTrigger(prev => prev + 1);
        setTimeout(() => {
          const el = document.getElementById('prescription-list-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setNotification({ message: editingPrescription ? 'Prescription updated successfully!' : 'Prescription created successfully!', type: 'success' });
      } else {
        setNotification({ message: data.error || 'Failed to save prescription', type: 'error' });
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      setNotification({ message: 'Failed to save prescription', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPrescription(null);
  };

  return (
    <>
      <NotificationToast
        message={notification?.message || ''}
        type={notification?.type || 'info'}
        isVisible={!!notification}
        onClose={() => setNotification(null)}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <DoctorNavbar />
        
        <main className="max-w-7xl mx-auto px-4 py-6">
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
                <PrescriptionList
                  doctorId={doctorId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
