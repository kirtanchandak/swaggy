import { NextResponse } from 'next/server';
import { getSession, isAuthenticated } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      authenticated: isAuthenticated(session),
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
