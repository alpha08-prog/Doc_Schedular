import { NextRequest, NextResponse } from 'next/server';

export interface Review {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// Use a global store so sibling route modules share the same data in dev
const g = global as unknown as { __REVIEWS__?: Review[] };
if (!g.__REVIEWS__) {
  g.__REVIEWS__ = [
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
}

function getStore(): Review[] {
  return g.__REVIEWS__!;
}
function setStore(arr: Review[]) {
  g.__REVIEWS__ = arr;
}

function buildStats(items: Review[]) {
  const total = items.length;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of items) {
    counts[r.rating] = (counts[r.rating] || 0) + 1;
    sum += r.rating;
  }
  const average = total ? Number((sum / total).toFixed(2)) : 0;
  const distribution = {
    5: total ? Math.round((counts[5] / total) * 100) : 0,
    4: total ? Math.round((counts[4] / total) * 100) : 0,
    3: total ? Math.round((counts[3] / total) * 100) : 0,
    2: total ? Math.round((counts[2] / total) * 100) : 0,
    1: total ? Math.round((counts[1] / total) * 100) : 0,
  };
  return { total, average, distribution, counts };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const ratingMin = searchParams.get('ratingMin');
    const ratingMax = searchParams.get('ratingMax');
    const sort = (searchParams.get('sort') || 'newest') as 'newest'|'oldest'|'highest'|'lowest';

    let data = [...getStore()];
    if (doctorId) data = data.filter(r => r.doctorId === doctorId);
    if (patientId) data = data.filter(r => r.patientId === patientId);
    if (appointmentId) data = data.filter(r => r.appointmentId === appointmentId);

    // Rating filters
    if (ratingMin) {
      const min = Math.max(1, Math.min(5, parseInt(ratingMin, 10)));
      data = data.filter(r => r.rating >= min);
    }
    if (ratingMax) {
      const max = Math.max(1, Math.min(5, parseInt(ratingMax, 10)));
      data = data.filter(r => r.rating <= max);
    }

    // Sorting
    if (sort === 'oldest') {
      data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'highest') {
      data.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'lowest') {
      data.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // newest
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const stats = buildStats(data);

    // Pagination
    const start = (page - 1) * pageSize;
    const paged = data.slice(start, start + pageSize);

    return NextResponse.json({ success: true, data: paged, page, pageSize, ...stats });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be 1-5' }, { status: 400 });
    }
    const review: Review = {
      id: `rev-${Date.now()}`,
      appointmentId: body.appointmentId,
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: body.doctorId,
      rating: Number(body.rating),
      comment: body.comment || '',
      createdAt: now,
      updatedAt: now,
    };
    const store = getStore();
    store.unshift(review);
    setStore(store);
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 });
  }
}
