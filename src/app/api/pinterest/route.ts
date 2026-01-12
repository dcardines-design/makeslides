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
    // Extract search query from URL
    const urlObj = new URL(url);
    let query = '';

    // Try to get query from URL params
    query = urlObj.searchParams.get('q') || '';

    // Or extract from path like /search/pins/fitness-aesthetic/
    if (!query) {
      const pathMatch = url.match(/\/search\/pins\/([^/?]+)/);
      if (pathMatch) {
        query = decodeURIComponent(pathMatch[1]).replace(/-/g, ' ');
      }
    }

    // Or extract board name from path
    if (!query) {
      const boardMatch = url.match(/pinterest\.com\/[^/]+\/([^/?]+)/);
      if (boardMatch && boardMatch[1] !== 'search' && boardMatch[1] !== 'pin') {
        query = decodeURIComponent(boardMatch[1]).replace(/-/g, ' ');
      }
    }

    if (!query) {
      query = 'aesthetic';
    }

    console.log('Pinterest search query:', query);

    // Use Pinterest's resource API
    const apiUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=/search/pins/?q=${encodeURIComponent(query)}&data=${encodeURIComponent(JSON.stringify({
      options: {
        query: query,
        scope: 'pins',
        page_size: 50,
      },
      context: {}
    }))}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.pinterest.com/',
      },
    });

    if (!response.ok) {
      console.log('Pinterest API failed, trying HTML fallback');
      return await fetchFromHtml(url);
    }

    const data = await response.json();
    const images: string[] = [];

    // Extract images from API response
    extractImagesFromObject(data, images);

    if (images.length === 0) {
      console.log('No images from API, trying HTML fallback');
      return await fetchFromHtml(url);
    }

    const uniqueImages = [...new Set(images)].slice(0, 30);
    const results = formatResults(uniqueImages);

    console.log(`Pinterest API found ${uniqueImages.length} images`);
    return NextResponse.json({ results });

  } catch (error) {
    console.error('Pinterest scrape error:', error);
    // Try HTML fallback
    try {
      return await fetchFromHtml(url);
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch Pinterest images', results: [] },
        { status: 500 }
      );
    }
  }
}

async function fetchFromHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const html = await response.text();
  const images: string[] = [];

  // Extract from __PWS_DATA__ or __PRELOADED_STATE__
  const dataPatterns = [
    /<script[^>]*id="__PWS_DATA__"[^>]*>([^<]+)<\/script>/,
    /<script[^>]*id="__PRELOADED_STATE__"[^>]*>([^<]+)<\/script>/,
    /window\.__PRELOADED_STATE__\s*=\s*({[^;]+});/,
  ];

  for (const pattern of dataPatterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        extractImagesFromObject(data, images);
      } catch (e) {
        // Continue to next pattern
      }
    }
  }

  // Also try regex extraction
  const imgRegex = /https:\/\/i\.pinimg\.com\/[^"'\s\]]+/g;
  const imgMatches = html.match(imgRegex) || [];
  for (const imgUrl of imgMatches) {
    processImageUrl(imgUrl, images);
  }

  const uniqueImages = [...new Set(images)].slice(0, 30);
  const results = formatResults(uniqueImages);

  console.log(`Pinterest HTML fallback found ${uniqueImages.length} images`);
  return NextResponse.json({ results });
}

function extractImagesFromObject(obj: unknown, images: string[], depth = 0): void {
  if (depth > 15 || !obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractImagesFromObject(item, images, depth + 1);
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  // Look for image objects with url property
  if (record.url && typeof record.url === 'string' && record.url.includes('pinimg.com')) {
    processImageUrl(record.url, images);
  }

  // Look for images object (Pinterest's structure)
  if (record.images && typeof record.images === 'object') {
    const imagesObj = record.images as Record<string, unknown>;
    for (const size of ['orig', '736x', '564x', '474x', '236x']) {
      const sizeObj = imagesObj[size] as Record<string, unknown> | undefined;
      if (sizeObj?.url && typeof sizeObj.url === 'string') {
        processImageUrl(sizeObj.url, images);
        break; // Only need one size per pin
      }
    }
  }

  // Recurse into nested objects
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (typeof value === 'string' && value.includes('pinimg.com')) {
      processImageUrl(value, images);
    } else if (typeof value === 'object' && value !== null) {
      extractImagesFromObject(value, images, depth + 1);
    }
  }
}

function processImageUrl(url: string, images: string[]): void {
  if (!url.includes('pinimg.com')) return;

  // Skip small thumbnails and non-image URLs
  if (url.includes('/30x30') || url.includes('/75x75') ||
      url.includes('/140x140') || url.includes('/60x60') ||
      url.includes('profile_') || url.includes('avatar')) {
    return;
  }

  // Convert to high-res version
  let highRes = url
    .replace(/\/\d+x\d+\//, '/736x/')
    .replace(/\/\d+x\d+_RS\//, '/736x/')
    .replace('/236x/', '/736x/')
    .replace('/474x/', '/736x/')
    .replace('/564x/', '/736x/')
    .replace('/170x/', '/736x/')
    .split('?')[0];

  if (highRes && !images.includes(highRes)) {
    images.push(highRes);
  }
}

function formatResults(images: string[]) {
  return images.map((imgUrl, index) => {
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
}

export const maxDuration = 30;
