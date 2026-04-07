import { NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  const validUsername = process.env.ADMIN_USERNAME || 'Admin';
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validPassword) {
    return NextResponse.json(
      { error: 'Server misconfigured — ADMIN_PASSWORD missing.' },
      { status: 500 }
    );
  }

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json(
      { error: 'Invalid username or password.' },
      { status: 401 }
    );
  }

  await setSession();

  return NextResponse.json({ success: true });
}
