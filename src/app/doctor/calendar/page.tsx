"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import DoctorNavbar from '../../components/doc_navbar';
import { appointmentService, type Appointment } from '../../services/appointmentService';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './calendar.css';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop<Appointment, object>(Calendar);



interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'reschedule' | 'cancel';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            type === 'cancel' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {type === 'cancel' ? (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
              type === 'cancel' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {type === 'cancel' ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AppointmentTooltipProps {
  appointment: Appointment;
  position: { x: number; y: number };
  onClose: () => void;
  onCancel: () => void;
}

const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  position,
  onClose,
  onCancel
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{appointment.resource.patientName}</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <span className="text-gray-500 w-16">Type:</span>
          <span className="font-medium">{appointment.resource.type}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-16">Time:</span>
          <span>{moment(appointment.start).format('h:mm A')} - {moment(appointment.end).format('h:mm A')}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-16">Phone:</span>
          <span>{appointment.resource.phone}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 w-16">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.resource.status)}`}>
            {appointment.resource.status}
          </span>
        </div>
        {appointment.resource.notes && (
          <div>
            <span className="text-gray-500 block">Notes:</span>
            <span className="text-gray-700">{appointment.resource.notes}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Cancel Appointment
        </button>
      </div>
    </div>
  );
};

export default function DoctorCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<string>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'reschedule' | 'cancel';
    appointment?: Appointment;
    newSlot?: { start: Date; end: Date };
    onConfirm: () => void;
  } | null>(null);
  const [tooltip, setTooltip] = useState<{
    appointment: Appointment;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await appointmentService.getAppointments();
      if (result.success) {
        // Ensure dates are properly converted to Date objects
        const processedAppointments = result.data.map(appointment => ({
          ...appointment,
          start: new Date(appointment.start),
          end: new Date(appointment.end)
        }));
        setAppointments(processedAppointments);
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // API functions using appointment service
  const updateAppointment = useCallback(async (id: number, updates: Partial<Appointment>) => {
    try {
      const result = await appointmentService.updateAppointment(id, updates);
      if (result.success && result.data) {
        setAppointments(prev => 
          prev.map(apt => apt.id === id ? result.data! : apt)
        );
        return { success: true };
      } else {
        console.error('Failed to update appointment:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, error: 'Failed to update appointment' };
    }
  }, []);

  const cancelAppointment = useCallback(async (id: number) => {
    try {
      const result = await appointmentService.cancelAppointment(id);
      if (result.success) {
        setAppointments(prev => prev.filter(apt => apt.id !== id));
        return { success: true };
      } else {
        console.error('Failed to cancel appointment:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      return { success: false, error: 'Failed to cancel appointment' };
    }
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }: any) => {
    const appointment = event as Appointment;
    
    setConfirmAction({
      type: 'reschedule',
      appointment,
      newSlot: { start, end },
      onConfirm: () => {
        updateAppointment(appointment.id, { start, end });
        setShowConfirmModal(false);
        setConfirmAction(null);
      }
    });
    setShowConfirmModal(true);
  }, [updateAppointment]);

  const handleEventResize = useCallback(({ event, start, end }: any) => {
    const appointment = event as Appointment;
    
    setConfirmAction({
      type: 'reschedule',
      appointment,
      newSlot: { start, end },
      onConfirm: () => {
        updateAppointment(appointment.id, { start, end });
        setShowConfirmModal(false);
        setConfirmAction(null);
      }
    });
    setShowConfirmModal(true);
  }, [updateAppointment]);

  const handleSelectEvent = useCallback((event: any, e: React.SyntheticEvent) => {
    const appointment = event as Appointment;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    setTooltip({
      appointment,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
  }, []);

  const handleCancelAppointment = useCallback((appointment: Appointment) => {
    setTooltip(null);
    setConfirmAction({
      type: 'cancel',
      appointment,
      onConfirm: () => {
        cancelAppointment(appointment.id);
        setShowConfirmModal(false);
        setConfirmAction(null);
      }
    });
    setShowConfirmModal(true);
  }, [cancelAppointment]);

  const eventStyleGetter = useCallback((event: any) => {
    const appointment = event as Appointment;
    let backgroundColor = '#3174ad';
    
    switch (appointment.resource.status) {
      case 'confirmed':
        backgroundColor = '#10b981';
        break;
      case 'pending':
        backgroundColor = '#f59e0b';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <DoctorNavbar />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">Manage your appointments with drag-and-drop functionality</p>
          </div>

          {/* Calendar Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDate(new Date())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Today
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDate(moment(date).subtract(1, view === Views.MONTH ? 'month' : 'week').toDate())}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                    {moment(date).format(view === Views.MONTH ? 'MMMM YYYY' : 'MMMM DD, YYYY')}
                  </span>
                  <button
                    onClick={() => setDate(moment(date).add(1, view === Views.MONTH ? 'month' : 'week').toDate())}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {[Views.MONTH, Views.WEEK, Views.DAY].map((viewName) => (
                  <button
                    key={viewName}
                    onClick={() => setView(viewName)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      view === viewName
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                💡 Drag appointments to reschedule • Click for details
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
            <div style={{ height: '600px' }}>
              <DragAndDropCalendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                view={view as any}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                resizable
                popup
                showMultiDayTimes
                step={30}
                timeslots={2}
                defaultView={Views.WEEK}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                messages={{
                  next: "Next",
                  previous: "Previous",
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day"
                }}
              />
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <AppointmentTooltip
            appointment={tooltip.appointment}
            position={tooltip.position}
            onClose={() => setTooltip(null)}
            onCancel={() => handleCancelAppointment(tooltip.appointment)}
          />
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && confirmAction && (
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setConfirmAction(null);
            }}
            onConfirm={confirmAction.onConfirm}
            title={
              confirmAction.type === 'cancel' 
                ? 'Cancel Appointment' 
                : 'Reschedule Appointment'
            }
            message={
              confirmAction.type === 'cancel'
                ? `Are you sure you want to cancel the appointment with ${confirmAction.appointment?.resource.patientName}? This action cannot be undone.`
                : `Are you sure you want to reschedule the appointment with ${confirmAction.appointment?.resource.patientName} to ${confirmAction.newSlot ? moment(confirmAction.newSlot.start).format('MMM DD, YYYY h:mm A') : ''}?`
            }
            type={confirmAction.type}
          />
        )}

        {/* Click outside to close tooltip */}
        {tooltip && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setTooltip(null)}
          />
        )}
      </div>
    </DndProvider>
  );
}
