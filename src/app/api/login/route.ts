import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (email && password) {
    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        name: 'John Doe',
        email,
        token: 'mock-token-123',
      },
    });
  }
  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}