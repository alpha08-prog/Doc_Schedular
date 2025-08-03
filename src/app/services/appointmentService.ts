// Mock API service for appointment management
export interface Appointment {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    patientName: string;
    type: string;
    phone: string;
    notes: string;
    status: 'confirmed' | 'pending' | 'cancelled';
  };
}

// Mock data storage (in a real app, this would be a database)
let appointmentsStore: Appointment[] = [
  {
    id: 1,
    title: 'John Doe - Consultation',
    start: new Date(2024, 0, 16, 9, 0),
    end: new Date(2024, 0, 16, 10, 0),
    resource: {
      patientName: 'John Doe',
      type: 'Consultation',
      phone: '+1234567890',
      notes: 'Regular checkup',
      status: 'confirmed'
    }
  },
  {
    id: 2,
    title: 'Sarah Smith - Follow-up',
    start: new Date(2024, 0, 16, 11, 0),
    end: new Date(2024, 0, 16, 12, 0),
    resource: {
      patientName: 'Sarah Smith',
      type: 'Follow-up',
      phone: '+1234567891',
      notes: 'Post-surgery checkup',
      status: 'confirmed'
    }
  },
  {
    id: 3,
    title: 'Mike Johnson - Emergency',
    start: new Date(2024, 0, 17, 14, 0),
    end: new Date(2024, 0, 17, 15, 0),
    resource: {
      patientName: 'Mike Johnson',
      type: 'Emergency',
      phone: '+1234567892',
      notes: 'Urgent care needed',
      status: 'pending'
    }
  },
  {
    id: 4,
    title: 'Emma Wilson - Check-up',
    start: new Date(2024, 0, 18, 10, 0),
    end: new Date(2024, 0, 18, 11, 0),
    resource: {
      patientName: 'Emma Wilson',
      type: 'Check-up',
      phone: '+1234567893',
      notes: 'Annual physical',
      status: 'confirmed'
    }
  },
  {
    id: 5,
    title: 'David Brown - Consultation',
    start: new Date(2024, 0, 19, 15, 0),
    end: new Date(2024, 0, 19, 16, 0),
    resource: {
      patientName: 'David Brown',
      type: 'Consultation',
      phone: '+1234567894',
      notes: 'First visit consultation',
      status: 'pending'
    }
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const appointmentService = {
  // Get all appointments
  async getAppointments(): Promise<{ success: boolean; data: Appointment[] }> {
    await delay(300);
    return {
      success: true,
      data: [...appointmentsStore]
    };
  },

  // Update appointment (reschedule)
  async updateAppointment(
    id: number, 
    updates: Partial<Appointment>
  ): Promise<{ success: boolean; data?: Appointment; error?: string }> {
    await delay(500);
    
    const appointmentIndex = appointmentsStore.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return {
        success: false,
        error: 'Appointment not found'
      };
    }

    // Check for conflicts if updating time
    if (updates.start || updates.end) {
      const newStart = updates.start || appointmentsStore[appointmentIndex].start;
      const newEnd = updates.end || appointmentsStore[appointmentIndex].end;
      
      const hasConflict = appointmentsStore.some((apt, index) => {
        if (index === appointmentIndex) return false; // Skip the current appointment
        
        return (
          (newStart >= apt.start && newStart < apt.end) ||
          (newEnd > apt.start && newEnd <= apt.end) ||
          (newStart <= apt.start && newEnd >= apt.end)
        );
      });

      if (hasConflict) {
        return {
          success: false,
          error: 'Time slot conflicts with another appointment'
        };
      }
    }

    // Update the appointment
    appointmentsStore[appointmentIndex] = {
      ...appointmentsStore[appointmentIndex],
      ...updates
    };

    // Update title if patient name or type changed
    if (updates.resource) {
      const updatedResource = {
        ...appointmentsStore[appointmentIndex].resource,
        ...updates.resource
      };
      appointmentsStore[appointmentIndex].resource = updatedResource;
      appointmentsStore[appointmentIndex].title = 
        `${updatedResource.patientName} - ${updatedResource.type}`;
    }

    return {
      success: true,
      data: appointmentsStore[appointmentIndex]
    };
  },

  // Cancel appointment (delete)
  async cancelAppointment(id: number): Promise<{ success: boolean; error?: string }> {
    await delay(400);
    
    const appointmentIndex = appointmentsStore.findIndex(apt => apt.id === id);
    
    if (appointmentIndex === -1) {
      return {
        success: false,
        error: 'Appointment not found'
      };
    }

    appointmentsStore.splice(appointmentIndex, 1);
    
    return {
      success: true
    };
  },

  // Create new appointment
  async createAppointment(
    appointmentData: Omit<Appointment, 'id'>
  ): Promise<{ success: boolean; data?: Appointment; error?: string }> {
    await delay(600);
    
    // Check for conflicts
    const hasConflict = appointmentsStore.some(apt => {
      return (
        (appointmentData.start >= apt.start && appointmentData.start < apt.end) ||
        (appointmentData.end > apt.start && appointmentData.end <= apt.end) ||
        (appointmentData.start <= apt.start && appointmentData.end >= apt.end)
      );
    });

    if (hasConflict) {
      return {
        success: false,
        error: 'Time slot conflicts with another appointment'
      };
    }

    const newAppointment: Appointment = {
      ...appointmentData,
      id: Math.max(...appointmentsStore.map(apt => apt.id), 0) + 1
    };

    appointmentsStore.push(newAppointment);

    return {
      success: true,
      data: newAppointment
    };
  },

  // Get appointments by date range
  async getAppointmentsByDateRange(
    startDate: Date, 
    endDate: Date
  ): Promise<{ success: boolean; data: Appointment[] }> {
    await delay(200);
    
    const filteredAppointments = appointmentsStore.filter(apt => 
      apt.start >= startDate && apt.start <= endDate
    );

    return {
      success: true,
      data: filteredAppointments
    };
  },

  // Get appointment statistics
  async getAppointmentStats(): Promise<{
    success: boolean;
    data: {
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      today: number;
      thisWeek: number;
    };
  }> {
    await delay(250);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const stats = {
      total: appointmentsStore.length,
      confirmed: appointmentsStore.filter(apt => apt.resource.status === 'confirmed').length,
      pending: appointmentsStore.filter(apt => apt.resource.status === 'pending').length,
      cancelled: appointmentsStore.filter(apt => apt.resource.status === 'cancelled').length,
      today: appointmentsStore.filter(apt => {
        const aptDate = new Date(apt.start.getFullYear(), apt.start.getMonth(), apt.start.getDate());
        return aptDate.getTime() === today.getTime();
      }).length,
      thisWeek: appointmentsStore.filter(apt => 
        apt.start >= weekStart && apt.start <= weekEnd
      ).length
    };

    return {
      success: true,
      data: stats
    };
  }
};

export default appointmentService;
