import type { Review } from '../../../types/review';

let reviews: Review[] = [
  {
    id: 'rev-001',
    appointmentId: 'apt-001',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    doctorId: '1',
    rating: 5,
    comment: 'Great experience, very attentive.',
    createdAt: '2024-01-15T10:45:00Z',
    updatedAt: '2024-01-15T10:45:00Z',
  },
  {
    id: 'rev-002',
    appointmentId: 'apt-002',
    patientId: 'patient-2',
    patientName: 'Michael Chen',
    doctorId: '1',
    rating: 4,
    comment: 'Helpful and professional.',
    createdAt: '2024-01-16T12:30:00Z',
    updatedAt: '2024-01-16T12:30:00Z',
  },
];

export const reviewStore = {
  all(): Review[] { return reviews; },
  findById(id: string): Review | undefined { return reviews.find(r => r.id === id); },
  create(data: Omit<Review,'id'|'createdAt'|'updatedAt'>): Review {
    const now = new Date().toISOString();
    const item: Review = { id: `rev-${Date.now()}`, ...data, createdAt: now, updatedAt: now };
    reviews.unshift(item);
    return item;
  },
  update(id: string, patch: Partial<Review>): Review | undefined {
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const next: Review = { ...reviews[idx], ...patch, updatedAt: new Date().toISOString() };
    reviews[idx] = next;
    return next;
  },
  remove(id: string): Review | undefined {
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const [removed] = reviews.splice(idx, 1);
    return removed;
  }
};
