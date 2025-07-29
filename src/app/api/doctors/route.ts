import { NextResponse } from 'next/server';
import doctors from '../../data/doctors.json';

export async function GET() {
  return NextResponse.json(doctors);
}