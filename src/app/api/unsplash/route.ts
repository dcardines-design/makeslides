import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query') || 'aesthetic';
  const page = searchParams.get('page') || '1';

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    // Return curated aesthetic/lifestyle sample images when no API key
    return NextResponse.json({
      results: [
        {
          id: '1',
          urls: {
            regular: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
            small: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
          },
          alt_description: 'Shopping bags',
        },
        {
          id: '2',
          urls: {
            regular: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            small: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          },
          alt_description: 'Store interior',
        },
        {
          id: '3',
          urls: {
            regular: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
            small: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          },
          alt_description: 'Shopping',
        },
        {
          id: '4',
          urls: {
            regular: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800',
            small: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400',
          },
          alt_description: 'Coffee aesthetic',
        },
        {
          id: '5',
          urls: {
            regular: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=800',
            small: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=400',
          },
          alt_description: 'Coffee shop',
        },
        {
          id: '6',
          urls: {
            regular: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
            small: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
          },
          alt_description: 'Cafe interior',
        },
        {
          id: '7',
          urls: {
            regular: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
            small: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
          },
          alt_description: 'Fashion',
        },
        {
          id: '8',
          urls: {
            regular: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
            small: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
          },
          alt_description: 'Mall',
        },
        {
          id: '9',
          urls: {
            regular: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
            small: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
          },
          alt_description: 'Street shopping',
        },
        {
          id: '10',
          urls: {
            regular: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800',
            small: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400',
          },
          alt_description: 'Workspace aesthetic',
        },
        {
          id: '11',
          urls: {
            regular: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          },
          alt_description: 'Portrait',
        },
        {
          id: '12',
          urls: {
            regular: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
            small: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
          },
          alt_description: 'Tech workspace',
        },
      ],
    });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=12&orientation=portrait`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
