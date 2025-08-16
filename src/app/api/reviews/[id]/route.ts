import { NextRequest, NextResponse } from 'next/server';
import type { Review } from '../../../../types/review';
import { reviewStore } from '../store';

function canModify(createdAtISO: string): boolean {
  const created = new Date(createdAtISO).getTime();
  const now = Date.now();
  const diffMs = now - created;
  const hours = diffMs / (1000 * 60 * 60);
  return hours <= 24;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const review = reviewStore.findById(params.id);
    if (!review) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: review });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const current = reviewStore.findById(params.id);
    if (!current) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (!canModify(current.createdAt)) {
      return NextResponse.json({ success: false, error: 'Edit window expired (24h)' }, { status: 403 });
    }

    const next = reviewStore.update(params.id, {
      rating: body.rating ? Math.max(1, Math.min(5, Number(body.rating))) : current.rating,
      comment: typeof body.comment === 'string' ? body.comment : current.comment,
    } as Partial<Review>);
    return NextResponse.json({ success: true, data: next! });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const current = reviewStore.findById(params.id);
    if (!current) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (!canModify(current.createdAt)) {
      return NextResponse.json({ success: false, error: 'Delete window expired (24h)' }, { status: 403 });
    }

    const removed = reviewStore.remove(params.id)!;
    return NextResponse.json({ success: true, data: removed });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
