import crypto from 'crypto';

const AUTHORIZE_URL = process.env.SWIGGY_OAUTH_AUTHORIZE_URL || 'https://mcp.swiggy.com/auth/authorize';
const TOKEN_URL = process.env.SWIGGY_OAUTH_TOKEN_URL || 'https://mcp.swiggy.com/auth/token';
const LOGOUT_URL = process.env.SWIGGY_OAUTH_LOGOUT_URL || 'https://mcp.swiggy.com/auth/logout';

export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

export function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

export function buildAuthorizationUrl({
  clientId,
  redirectUri,
  codeChallenge,
  state,
}: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
}) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    scope: 'mcp:tools mcp:resources mcp:prompts',
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken({
  code,
  codeVerifier,
  clientId,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  clientId: string;
  redirectUri: string;
}) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: clientId,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) || 432000,
  };
}

export async function registerOAuthClient(redirectUri: string): Promise<string> {
  try {
    const metaRes = await fetch('https://mcp.swiggy.com/.well-known/oauth-authorization-server');
    if (metaRes.ok) {
      const meta = await metaRes.json();
      const registrationEndpoint = meta.registration_endpoint;
      if (registrationEndpoint) {
        const regRes = await fetch(registrationEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_name: 'flex3',
            redirect_uris: [redirectUri],
            grant_types: ['authorization_code'],
            response_types: ['code'],
            token_endpoint_auth_method: 'none',
          }),
        });
        if (regRes.ok) {
          const regData = await regRes.json();
          return regData.client_id as string;
        }
      }
    }
  } catch {
    // Fall through to default
  }
  return 'swaggy-food-agent';
}

export async function logoutSwiggy(accessToken: string) {
  try {
    await fetch(LOGOUT_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Ignore logout errors
  }
}
