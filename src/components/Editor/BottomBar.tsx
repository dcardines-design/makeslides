'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Plus, RefreshCw } from 'lucide-react';

export default function BottomBar() {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    addSlide,
    regenerateSlide,
    lastPrompt,
  } = useEditorStore();

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleRegenerate = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lastPrompt) return;

    setRegeneratingIndex(index);
    await regenerateSlide(index);
    setRegeneratingIndex(null);
  };

  const handleExportAll = async () => {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    const folder = zip.folder('tiktok-slides');
    if (!folder) return;

    const originalSlideIndex = currentSlideIndex;

    // Export each slide by switching to it and capturing
    for (let i = 0; i < slides.length; i++) {
      // Switch to the slide
      setCurrentSlide(i);

      // Wait for canvas to render
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = document.querySelector('canvas');
      if (!canvas) continue;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1080;
      tempCanvas.height = 1920;
      const ctx = tempCanvas.getContext('2d');

      if (ctx) {
        const scale = 1080 / canvas.width;
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);
      }

      const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.split(',')[1];
      folder.file(`slide-${i + 1}.png`, base64Data, { base64: true });
    }

    // Restore original slide
    setCurrentSlide(originalSlideIndex);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `tiktok-slides-${Date.now()}.zip`);
  };

  return (
    <div className="pt-[60px] pb-[50px] px-0 bg-[#0a0a0a]">
      {/* Container with surface background */}
      <div className="bg-[#1F1F1F] border border-[#2B2B2B] rounded-[20px] p-[20px] flex items-center justify-between mx-4">
        {/* Left side - Slide Thumbnails */}
        <div className="flex items-center gap-[16px] p-[20px] bg-[#141414] rounded-[10px] overflow-x-auto flex-1 mr-[20px]">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative group flex-shrink-0">
              <button
                onClick={() => setCurrentSlide(index)}
                className={`relative w-[60px] h-[90px] rounded-[10px] overflow-hidden transition-all ${
                  index === currentSlideIndex
                    ? 'ring-2 ring-[#3B1FD1]'
                    : 'hover:ring-1 hover:ring-[#333]'
                }`}
              >
                {slide.backgroundImage ? (
                  <img
                    src={slide.backgroundImage}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter: `brightness(${slide.backgroundBrightness}%)`,
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                    <span className="text-[#555] text-xs">{index + 1}</span>
                  </div>
                )}

                {/* Text preview overlay */}
                {slide.elements.length > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/30">
                    <span className="text-[5px] text-white text-center leading-tight line-clamp-3">
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

              {/* Regenerate button on hover */}
              {lastPrompt && regeneratingIndex !== index && (
                <button
                  onClick={(e) => handleRegenerate(index, e)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#3B1FD1] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-[#4B2DE1]"
                  title="Regenerate this slide"
                >
                  <RefreshCw size={10} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex flex-col gap-[16px] p-[20px] bg-[#141414] border border-[#2B2B2B] rounded-[10px] flex-shrink-0">
          <button
            onClick={handleExportAll}
            className="px-10 py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[14px] tracking-[1.68px] transition-colors hover:bg-[#4B2DE1]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            EXPORT ALL
          </button>
          <button
            onClick={addSlide}
            className="px-10 py-3 rounded-[10px] bg-[#141414] border border-[#2B2B2B] text-white font-medium text-[14px] tracking-[1.68px] transition-colors hover:bg-[#2a2a2a] flex items-center justify-center gap-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Plus size={16} />
            ADD SLIDE
          </button>
        </div>
      </div>
    </div>
  );
}
