import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import { chromium as playwrightChromium } from 'playwright-core';

// Optimize chromium for serverless
chromium.setHeadlessMode = 'shell';
chromium.setGraphicsMode = false;

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
    // Launch browser with serverless-compatible settings
    const executablePath = await chromium.executablePath();

    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Navigate to Pinterest - use domcontentloaded for faster loading
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Wait for images to load
    await page.waitForTimeout(2000);

    // Scroll to load more images (reduced iterations for serverless)
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForTimeout(1000);
    }

    // Extract image URLs
    const imageUrls = await page.evaluate(() => {
      const images: string[] = [];

      // Get all images on the page
      const imgElements = document.querySelectorAll('img');

      imgElements.forEach((img) => {
        const src = img.src || img.getAttribute('data-src') || '';

        // Filter for Pinterest CDN images (pinimg.com)
        if (src.includes('pinimg.com') && src.includes('/')) {
          // Skip very small thumbnails and icons
          if (src.includes('/30x30/') || src.includes('/30x30_RS/') ||
              src.includes('/75x75/') || src.includes('/75x75_RS/')) {
            return;
          }

          // Convert to high-res version (736x is a good balance)
          let highRes = src
            .replace('/236x/', '/736x/')
            .replace('/474x/', '/736x/')
            .replace('/564x/', '/736x/')
            .replace('/170x/', '/736x/');

          // Remove any query params
          highRes = highRes.split('?')[0];

          if (highRes && !images.includes(highRes)) {
            images.push(highRes);
          }
        }
      });

      return images;
    });

    await browser.close();

    // Format results
    const results = imageUrls.slice(0, 30).map((url, index) => {
      // Generate small thumbnail by replacing size in URL
      const small = url.replace('/736x/', '/236x/').replace('/originals/', '/236x/');
      return {
        id: `pinterest-${index}`,
        urls: {
          regular: url,
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
      await browser.close();
    }
    return NextResponse.json(
      { error: 'Failed to fetch Pinterest images', results: [] },
      { status: 500 }
    );
  }
}

// Increase timeout for this route
export const maxDuration = 60;
