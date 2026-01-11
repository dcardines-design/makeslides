import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('tiktok_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ connected: false }, { status: 200 });
  }

  try {
    // Fetch user info from TikTok
    const response = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (data.error) {
      // Token might be expired
      cookieStore.delete('tiktok_access_token');
      cookieStore.delete('tiktok_refresh_token');
      cookieStore.delete('tiktok_open_id');
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    return NextResponse.json({
      connected: true,
      user: data.data?.user || null,
    });
  } catch (error) {
    console.error('TikTok profile fetch error:', error);
    return NextResponse.json({ connected: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete('tiktok_access_token');
  cookieStore.delete('tiktok_refresh_token');
  cookieStore.delete('tiktok_open_id');

  return NextResponse.json({ success: true });
}
