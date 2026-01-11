import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('tiktok_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not connected to TikTok' }, { status: 401 });
  }

  try {
    // Fetch user's videos
    const videosResponse = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_count: 20,
      }),
    });

    const videosData = await videosResponse.json();

    if (videosData.error) {
      console.error('TikTok videos fetch error:', videosData);
      return NextResponse.json({
        error: videosData.error.message || 'Failed to fetch videos'
      }, { status: 400 });
    }

    const videos = videosData.data?.videos || [];

    // Calculate aggregate stats
    const totalViews = videos.reduce((sum: number, v: { view_count?: number }) => sum + (v.view_count || 0), 0);
    const totalLikes = videos.reduce((sum: number, v: { like_count?: number }) => sum + (v.like_count || 0), 0);
    const totalComments = videos.reduce((sum: number, v: { comment_count?: number }) => sum + (v.comment_count || 0), 0);
    const totalShares = videos.reduce((sum: number, v: { share_count?: number }) => sum + (v.share_count || 0), 0);

    return NextResponse.json({
      videos,
      stats: {
        totalVideos: videos.length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
      },
      hasMore: videosData.data?.has_more || false,
      cursor: videosData.data?.cursor,
    });
  } catch (error) {
    console.error('TikTok analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
