import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('tiktok_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not connected to TikTok' }, { status: 401 });
  }

  try {
    const { images, title, description } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Step 1: Initialize photo post
    const initResponse = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: title || 'My TikTok Slides',
          description: description || '',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          privacy_level: 'SELF_ONLY', // Start with private, user can change
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_cover_index: 0,
          photo_images: images.map((url: string) => url),
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    });

    const initData = await initResponse.json();

    if (initData.error) {
      console.error('TikTok upload init error:', initData);
      return NextResponse.json({
        error: initData.error.message || 'Failed to initialize upload'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      publishId: initData.data?.publish_id,
    });
  } catch (error) {
    console.error('TikTok upload error:', error);
    return NextResponse.json({ error: 'Failed to upload to TikTok' }, { status: 500 });
  }
}
