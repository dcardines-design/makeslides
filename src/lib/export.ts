import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Slide } from '@/stores/editorStore';

// Re-render slide at full resolution and export
export async function exportSlide(
  canvasEl: HTMLCanvasElement,
  slideIndex: number
): Promise<void> {
  // Export at original resolution
  const dataUrl = canvasEl.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = `tiktok-slide-${slideIndex + 1}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportAllSlides(
  slides: Slide[],
  renderSlideToCanvas: (slide: Slide) => Promise<string>
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('tiktok-slides');

  if (!folder) {
    throw new Error('Failed to create zip folder');
  }

  for (let i = 0; i < slides.length; i++) {
    const dataUrl = await renderSlideToCanvas(slides[i]);
    // Remove the data:image/png;base64, prefix
    const base64Data = dataUrl.split(',')[1];
    folder.file(`slide-${i + 1}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `tiktok-slides-${Date.now()}.zip`);
}
