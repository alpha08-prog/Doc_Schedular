'use client';

import { useState } from 'react';
import { Prescription } from '../api/prescriptions/route';

interface PrescriptionFormProps {
  doctorId: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  prescription?: Prescription;
  onSubmit: (prescriptionData: Partial<Prescription>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PrescriptionForm({
  doctorId,
  patientId = '',
  patientName = '',
  appointmentId = '',
  prescription,
  onSubmit,
  onCancel,
  isLoading = false
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState({
    patientId: prescription?.patientId || patientId,
    patientName: prescription?.patientName || patientName,
    appointmentId: prescription?.appointmentId || appointmentId,
    medicineName: prescription?.medicineName || '',
    dosage: prescription?.dosage || '',
    duration: prescription?.duration || '',
    notes: prescription?.notes || '',
    prescriptionDate: prescription?.prescriptionDate || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (!formData.prescriptionDate) {
      newErrors.prescriptionDate = 'Prescription date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        doctorId,
        patientId: formData.patientId || `patient-${Date.now()}`
      });
    } catch (error) {
      console.error('Error submitting prescription:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto overflow-auto" style={{maxHeight: '90vh'}}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {prescription ? 'Edit Prescription' : 'Create New Prescription'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name *
            </label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                errors.patientName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter patient name"
            />
            {errors.patientName && (
              <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>
            )}
          </div>

          <div>
            <label htmlFor="appointmentId" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment ID
            </label>
            <input
              type="text"
              id="appointmentId"
              name="appointmentId"
              value={formData.appointmentId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter appointment ID"
            />
          </div>
        </div>

        {/* Medicine Information */}
        <div>
          <label htmlFor="medicineName" className="block text-sm font-medium text-gray-700 mb-1">
            Medicine Name *
          </label>
          <input
            type="text"
            id="medicineName"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
              errors.medicineName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter medicine name"
          />
          {errors.medicineName && (
            <p className="text-red-500 text-sm mt-1">{errors.medicineName}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
              Dosage *
            </label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                errors.dosage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 500mg twice daily"
            />
            {errors.dosage && (
              <p className="text-red-500 text-sm mt-1">{errors.dosage}</p>
            )}
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 7 days"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="prescriptionDate" className="block text-sm font-medium text-gray-700 mb-1">
            Prescription Date *
          </label>
          <input
            type="date"
            id="prescriptionDate"
            name="prescriptionDate"
            value={formData.prescriptionDate}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
              errors.prescriptionDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.prescriptionDate && (
            <p className="text-red-500 text-sm mt-1">{errors.prescriptionDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes/Instructions
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter any additional notes or instructions"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : prescription ? 'Update Prescription' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
}
