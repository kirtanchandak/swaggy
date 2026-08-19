import { NextResponse } from 'next/server';
import { getSession, isAuthenticated } from '@/lib/session';
import { logoutSwiggy } from '@/lib/oauth';

export async function POST() {
  try {
    const session = await getSession();
    
    if (isAuthenticated(session) && session.swiggy?.accessToken) {
      await logoutSwiggy(session.swiggy.accessToken);
    }

    // Destroy session
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
