import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generatePKCE, generateState, registerOAuthClient, buildAuthorizationUrl } from '@/lib/oauth';

export async function GET() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/callback`;

    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = generateState();

    // Register OAuth client dynamically
    const clientId = await registerOAuthClient(redirectUri);

    // Build auth URL
    const authUrl = buildAuthorizationUrl({
      clientId,
      redirectUri,
      codeChallenge,
      state,
    });

    // Store PKCE state in session
    const session = await getSession();
    session.oauthState = { codeVerifier, state, clientId };
    await session.save();

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth init error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?error=auth_failed`
    );
  }
}
