import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { exchangeCodeForToken } from '@/lib/oauth';

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/callback`;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${appUrl}/?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}/?error=missing_params`);
    }

    // Retrieve stored OAuth state
    const session = await getSession();
    const stored = session.oauthState;

    if (!stored || stored.state !== state) {
      return NextResponse.redirect(`${appUrl}/?error=invalid_state`);
    }

    // Exchange code for token
    const { accessToken, expiresIn } = await exchangeCodeForToken({
      code,
      codeVerifier: stored.codeVerifier,
      clientId: stored.clientId,
      redirectUri,
    });

    // Store token in session
    session.swiggy = {
      accessToken,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
    };
    delete session.oauthState;
    await session.save();

    return NextResponse.redirect(`${appUrl}/chat`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${appUrl}/?error=callback_failed`);
  }
}
