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

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export function isAuthenticated(session: SessionData): boolean {
  if (!session.swiggy?.accessToken) return false;
  if (session.swiggy.expiresAt && Date.now() / 1000 > session.swiggy.expiresAt) return false;
  return true;
}
