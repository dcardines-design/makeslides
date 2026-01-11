import { NextResponse } from 'next/server';

// TikTok OAuth configuration
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/api/tiktok/callback';

// Scopes for TikTok API access
const SCOPES = [
  'user.info.basic',
  'user.info.profile',
  'user.info.stats',
  'video.publish',
  'video.upload',
  'video.list',
].join(',');

export async function GET() {
  if (!TIKTOK_CLIENT_KEY) {
    return NextResponse.json(
      { error: 'TikTok client key not configured' },
      { status: 500 }
    );
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  // Build the TikTok authorization URL
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
  authUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', state);

  // Return the auth URL for the client to redirect to
  return NextResponse.json({
    authUrl: authUrl.toString(),
    state,
  });
}
