import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production-min-32-chars',
  cookieName: 'swaggy-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export interface SessionData {
  userId?: string;
  swiggy?: {
    accessToken: string;
    expiresAt: number;
  };
  oauthState?: {
    codeVerifier: string;
    state: string;
    clientId: string;
  };
}

import { v4 as uuidv4 } from 'uuid';

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  
  if (!session.userId) {
    session.userId = uuidv4();
    await session.save();
  }
  
  return session;
}

export function isAuthenticated(session: SessionData): boolean {
  if (!session.swiggy?.accessToken) return false;
  if (session.swiggy.expiresAt && Date.now() / 1000 > session.swiggy.expiresAt) return false;
  return true;
}
