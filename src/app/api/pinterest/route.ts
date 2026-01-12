import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

// Remote Chromium URL for serverless (keeps function size small)
const CHROMIUM_URL = 'https://github.com/nichenqin/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!url.includes('pinterest.com')) {
    return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 });
  }

  let browser;
  try {
    const executablePath = await chromium.executablePath(CHROMIUM_URL);

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to Pinterest
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });

    // Wait for images to load
    await page.waitForSelector('img[src*="pinimg.com"]', { timeout: 10000 }).catch(() => {});

    // Scroll to load more images
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise(r => setTimeout(r, 1000));
    }

    // Extract image URLs
    const imageUrls = await page.evaluate(() => {
      const images: string[] = [];
      const imgElements = document.querySelectorAll('img');

      imgElements.forEach((img) => {
        const src = img.src || img.getAttribute('data-src') || '';

        if (src.includes('pinimg.com') && src.includes('/')) {
          // Skip small thumbnails
          if (src.includes('/30x30') || src.includes('/75x75') ||
              src.includes('/60x60') || src.includes('/140x140')) {
            return;
          }

          // Convert to high-res
          let highRes = src
            .replace('/236x/', '/736x/')
            .replace('/474x/', '/736x/')
            .replace('/564x/', '/736x/')
            .replace('/170x/', '/736x/')
            .split('?')[0];

          if (highRes && !images.includes(highRes)) {
            images.push(highRes);
          }
        }
      });

      return images;
    });

    await browser.close();

    // Format results
    const results = imageUrls.slice(0, 30).map((imgUrl, index) => {
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

    console.log(`Pinterest scrape found ${imageUrls.length} images, returning ${results.length}`);

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Pinterest scrape error:', error);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return NextResponse.json(
      { error: 'Failed to fetch Pinterest images', results: [] },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
