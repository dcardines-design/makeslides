import { NextRequest, NextResponse } from 'next/server';
import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

const isLocal = process.env.NODE_ENV === 'development';

// Remote Chromium for production (Vercel)
const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar';

async function getBrowser(): Promise<Browser> {
  if (isLocal) {
    // Use local Chrome on Mac
    return puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } else {
    // Use remote Chromium for serverless
    const executablePath = await chromium.executablePath(CHROMIUM_URL);
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!url.includes('pinterest.com')) {
    return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 });
  }

  let browser: Browser | null = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to Pinterest
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for images to load
    await page.waitForSelector('img[src*="pinimg.com"]', { timeout: 10000 }).catch(() => {
      console.log('No pinimg images found with selector, continuing...');
    });

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
    browser = null;

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
