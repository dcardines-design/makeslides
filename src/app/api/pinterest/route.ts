import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!url.includes('pinterest.com')) {
    return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 });
  }

  try {
    // Fetch Pinterest page HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Pinterest page: ${response.status}`);
    }

    const html = await response.text();
    const images: string[] = [];

    // Method 1: Extract from __PWS_DATA__ script tag (Pinterest's initial data)
    const pwsMatch = html.match(/<script[^>]*id="__PWS_DATA__"[^>]*>([^<]+)<\/script>/);
    if (pwsMatch) {
      try {
        const data = JSON.parse(pwsMatch[1]);
        extractImagesFromObject(data, images);
      } catch (e) {
        console.log('Failed to parse __PWS_DATA__');
      }
    }

    // Method 2: Extract from application/json script tags
    const jsonScriptRegex = /<script[^>]*type="application\/json"[^>]*>([^<]+)<\/script>/g;
    let jsonMatch;
    while ((jsonMatch = jsonScriptRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        extractImagesFromObject(data, images);
      } catch (e) {
        // Skip invalid JSON
      }
    }

    // Method 3: Extract image URLs directly from HTML using regex
    const imgRegex = /https:\/\/i\.pinimg\.com\/[^"'\s]+/g;
    const imgMatches = html.match(imgRegex) || [];
    for (const imgUrl of imgMatches) {
      processImageUrl(imgUrl, images);
    }

    // Deduplicate and limit
    const uniqueImages = [...new Set(images)].slice(0, 30);

    // Format results
    const results = uniqueImages.map((imgUrl, index) => {
      const small = imgUrl.replace('/736x/', '/236x/').replace('/originals/', '/236x/');
      return {
        id: `pinterest-${index}`,
        urls: {
          regular: imgUrl,
          small: small,
        },
        alt_description: 'Pinterest image',
      };
    });

    console.log(`Pinterest scrape found ${uniqueImages.length} images`);

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Pinterest scrape error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pinterest images', results: [] },
      { status: 500 }
    );
  }
}

function extractImagesFromObject(obj: unknown, images: string[]): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractImagesFromObject(item, images);
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  // Check for image URL properties
  for (const key of Object.keys(record)) {
    const value = record[key];

    if (typeof value === 'string' && value.includes('pinimg.com')) {
      processImageUrl(value, images);
    } else if (typeof value === 'object' && value !== null) {
      extractImagesFromObject(value, images);
    }
  }
}

function processImageUrl(url: string, images: string[]): void {
  // Skip small thumbnails
  if (url.includes('/30x30/') || url.includes('/75x75/') ||
      url.includes('/30x30_RS/') || url.includes('/75x75_RS/')) {
    return;
  }

  // Convert to high-res version
  let highRes = url
    .replace('/236x/', '/736x/')
    .replace('/474x/', '/736x/')
    .replace('/564x/', '/736x/')
    .replace('/170x/', '/736x/')
    .replace('/140x140/', '/736x/')
    .split('?')[0]; // Remove query params

  if (highRes && !images.includes(highRes)) {
    images.push(highRes);
  }
}

export const maxDuration = 30;
