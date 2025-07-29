import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { doctorId, userId, timeslot } = await request.json();
  if (doctorId && userId && timeslot) {
    return NextResponse.json({
      success: true,
      booking: {
        id: Math.floor(Math.random() * 10000),
        doctorId,
        userId,
        timeslot,
        status: 'confirmed',
      },
    });
  }
  return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
}