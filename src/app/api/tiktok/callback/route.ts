import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/api/tiktok/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('TikTok OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/?tiktok_error=${encodeURIComponent(errorDescription || error)}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?tiktok_error=No authorization code received', request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.redirect(new URL(`/?tiktok_error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`, request.url));
    }

    // Store tokens in cookies (in production, use a more secure method)
    const cookieStore = await cookies();

    cookieStore.set('tiktok_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 86400,
    });

    if (tokenData.refresh_token) {
      cookieStore.set('tiktok_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenData.refresh_expires_in || 31536000,
      });
    }

    cookieStore.set('tiktok_open_id', tokenData.open_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 31536000,
    });

    // Redirect to home with success
    return NextResponse.redirect(new URL('/?tiktok_connected=true', request.url));
  } catch (error) {
    console.error('TikTok callback error:', error);
    return NextResponse.redirect(new URL('/?tiktok_error=Failed to connect TikTok account', request.url));
  }
}
