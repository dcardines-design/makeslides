'use client';

import { useState } from 'react';
import { useEditorStore, Slide } from '@/stores/editorStore';
import { Plus, RefreshCw, X, Loader2 } from 'lucide-react';

export default function SlidePicker() {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    addSlide,
    deleteSlide,
    regenerateSlide,
    lastPrompt,
  } = useEditorStore();

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleRegenerate = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lastPrompt) return;

    setRegeneratingIndex(index);
    await regenerateSlide(index);
    setRegeneratingIndex(null);
  };

  // Render a slide to canvas
  const renderSlideToCanvas = (slide: Slide): Promise<string> => {
    return new Promise((resolve) => {
      const CANVAS_WIDTH = 1080;
      const CANVAS_HEIGHT = 1920;

      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const drawTextElements = () => {
        for (const element of slide.elements) {
          ctx.save();

          if (element.type === 'badge' && element.backgroundColor) {
            // Draw badge background
            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            const metrics = ctx.measureText(element.text);
            const textWidth = Math.min(metrics.width, element.width);
            const padding = 20;

            ctx.fillStyle = element.backgroundColor;
            const bgX = element.x - textWidth / 2 - padding;
            const bgY = element.y - element.fontSize / 2 - padding;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = element.fontSize + padding * 2;

            // Rounded rectangle
            const radius = 10;
            ctx.beginPath();
            ctx.moveTo(bgX + radius, bgY);
            ctx.lineTo(bgX + bgWidth - radius, bgY);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + radius);
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - radius);
            ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - radius, bgY + bgHeight);
            ctx.lineTo(bgX + radius, bgY + bgHeight);
            ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - radius);
            ctx.lineTo(bgX, bgY + radius);
            ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
            ctx.closePath();
            ctx.fill();

            // Draw text
            ctx.fillStyle = element.fill;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.text, element.x, element.y, element.width);
          } else {
            // Body text with shadow
            if (element.shadowEnabled) {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
              ctx.shadowBlur = 10;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
            }

            ctx.font = `${element.fontSize}px ${element.fontFamily}`;
            ctx.fillStyle = element.fill;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Word wrap
            const words = element.text.split(' ');
            const lineHeight = element.fontSize * 1.3;
            let line = '';
            const lines: string[] = [];

            for (const word of words) {
              const testLine = line + (line ? ' ' : '') + word;
              const metrics = ctx.measureText(testLine);
              if (metrics.width > element.width && line) {
                lines.push(line);
                line = word;
              } else {
                line = testLine;
              }
            }
            lines.push(line);

            // Center lines vertically
            const totalHeight = lines.length * lineHeight;
            let y = element.y - totalHeight / 2 + lineHeight / 2;

            for (const l of lines) {
              ctx.fillText(l, element.x, y);
              y += lineHeight;
            }
          }

          ctx.restore();
        }

        resolve(canvas.toDataURL('image/png', 1.0));
      };

      // Draw background image if exists
      if (slide.backgroundImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Scale to cover canvas
          const imgScale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
          const drawWidth = img.width * imgScale;
          const drawHeight = img.height * imgScale;
          const drawX = (CANVAS_WIDTH - drawWidth) / 2;
          const drawY = (CANVAS_HEIGHT - drawHeight) / 2;

          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          // Apply brightness overlay
          if (slide.backgroundBrightness < 100) {
            ctx.fillStyle = `rgba(0, 0, 0, ${(100 - slide.backgroundBrightness) / 100})`;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }

          drawTextElements();
        };
        img.onerror = () => {
          // If image fails to load, just draw text
          drawTextElements();
        };
        img.src = slide.backgroundImage;
      } else {
        drawTextElements();
      }
    });
  };

  const handleExportAll = async () => {
    setIsExporting(true);

    try {
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');

      const zip = new JSZip();
      const folder = zip.folder('tiktok-slides');
      if (!folder) return;

      // Render each slide to canvas and add to zip
      for (let i = 0; i < slides.length; i++) {
        const dataUrl = await renderSlideToCanvas(slides[i]);
        if (dataUrl) {
          const base64Data = dataUrl.split(',')[1];
          folder.file(`slide-${i + 1}.png`, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `tiktok-slides-${Date.now()}.zip`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex items-stretch border border-[#2B2B2B] rounded-[24px] overflow-hidden">
      {/* Thumbnails container */}
      <div className="flex-1 flex items-center px-[12px] py-[12px] bg-[#141414] overflow-hidden">
        <div className="flex items-center gap-[14px] overflow-x-auto scrollbar-hide p-1 h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {slides.map((slide, index) => (
          <div key={slide.id} className="relative group flex-shrink-0 h-full">
            <button
              onClick={() => setCurrentSlide(index)}
              className={`relative h-full aspect-[9/16] rounded-[8px] overflow-hidden transition-all ${
                index === currentSlideIndex
                  ? 'ring-2 ring-[#3B1FD1]'
                  : 'hover:ring-1 hover:ring-[#333]'
              }`}
            >
              {slide.backgroundImage ? (
                <img
                  src={slide.backgroundImage}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: `brightness(${slide.backgroundBrightness}%)`,
                  }}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-[#555] text-xs">{index + 1}</span>
                </div>
              )}

              {/* Text preview overlay */}
              {slide.elements.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/30 overflow-hidden">
                  <span className="text-[6px] text-white text-center leading-tight line-clamp-3 break-words w-full px-1">
                    {slide.elements[0]?.text?.substring(0, 40)}
                  </span>
                </div>
              )}

              {/* Regenerating overlay */}
              {regeneratingIndex === index && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <RefreshCw size={14} className="text-white animate-spin" />
                </div>
              )}
            </button>

            {/* Hover actions */}
            {regeneratingIndex !== index && (
              <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Regenerate button */}
                {lastPrompt && (
                  <button
                    onClick={(e) => handleRegenerate(index, e)}
                    className="w-5 h-5 rounded-full bg-[#3B1FD1] text-white flex items-center justify-center hover:bg-[#4B2DE1]"
                    title="Regenerate this slide"
                  >
                    <RefreshCw size={10} />
                  </button>
                )}
                {/* Delete button */}
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(index);
                    }}
                    className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    title="Delete this slide"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-[16px] flex-shrink-0 p-[16px] bg-[#141414] border-l border-[#2B2B2B]">
        <button
          onClick={handleExportAll}
          disabled={isExporting}
          className="px-[14px] py-[8px] rounded-[8px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1px] transition-colors hover:bg-[#4B2DE1] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {isExporting ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              EXPORTING...
            </>
          ) : (
            'EXPORT ALL'
          )}
        </button>
        <button
          onClick={addSlide}
          className="px-[14px] py-[8px] rounded-[8px] bg-[#1F1F1F] border border-[#2B2B2B] text-white font-medium text-[12px] tracking-[1px] transition-colors hover:bg-[#2a2a2a] flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <Plus size={12} />
          ADD SLIDE
        </button>
      </div>
    </div>
  );
}
