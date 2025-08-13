import { NextRequest, NextResponse } from 'next/server';
import type { Review } from '../route';
import { headers } from 'next/headers';

// Use the same in-memory store as ../route by importing/requiring is not feasible across module scope in Next.js.
// For mock purposes within a single process dev server, we re-declare and rely on a simple global.

const g = global as unknown as { __REVIEWS__?: Review[] };
if (!g.__REVIEWS__) {
  g.__REVIEWS__ = [];
}

function getStore(): Review[] {
  // Attempt to access the store populated by /api/reviews route if available via global.
  // Fallback: keep local array.
  return g.__REVIEWS__!;
}

function setStore(arr: Review[]) {
  g.__REVIEWS__ = arr;
}

function canModify(createdAtISO: string): boolean {
  const created = new Date(createdAtISO).getTime();
  const now = Date.now();
  const diffMs = now - created;
  const hours = diffMs / (1000 * 60 * 60);
  return hours <= 24;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = getStore();
    const review = store.find(r => r.id === params.id);
    if (!review) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: review });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const store = getStore();
    const idx = store.findIndex(r => r.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const current = store[idx];
    if (!canModify(current.createdAt)) {
      return NextResponse.json({ success: false, error: 'Edit window expired (24h)' }, { status: 403 });
    }

    const next: Review = {
      ...current,
      rating: body.rating ? Math.max(1, Math.min(5, Number(body.rating))) : current.rating,
      comment: typeof body.comment === 'string' ? body.comment : current.comment,
      updatedAt: new Date().toISOString(),
    };
    store[idx] = next;
    setStore(store);
    return NextResponse.json({ success: true, data: next });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = getStore();
    const idx = store.findIndex(r => r.id === params.id);
    if (idx === -1) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    const current = store[idx];
    if (!canModify(current.createdAt)) {
      return NextResponse.json({ success: false, error: 'Delete window expired (24h)' }, { status: 403 });
    }

    const removed = store.splice(idx, 1)[0];
    setStore(store);
    return NextResponse.json({ success: true, data: removed });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
