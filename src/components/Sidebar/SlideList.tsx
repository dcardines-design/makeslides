'use client';

import { useEditorStore } from '@/stores/editorStore';
import { Plus, Copy, Trash2 } from 'lucide-react';

export default function SlideList() {
  const {
    slides,
    currentSlideIndex,
    setCurrentSlide,
    addSlide,
    duplicateSlide,
    deleteSlide,
  } = useEditorStore();

  return (
    <div className="w-64 bg-[#141414] border-r border-[#262626] flex flex-col">
      <div className="p-4 border-b border-[#262626] flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Slides</h2>
        <button
          onClick={addSlide}
          className="p-1.5 rounded-md hover:bg-[#262626] text-[#737373] hover:text-white transition-colors"
          title="Add Slide"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`group relative aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
              index === currentSlideIndex
                ? 'border-[#3B1DD1]'
                : 'border-[#262626] hover:border-[#404040]'
            }`}
          >
            {/* Slide thumbnail preview */}
            <div className="absolute inset-0 bg-[#1a1a1a]">
              {slide.backgroundImage && (
                <img
                  src={slide.backgroundImage}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                    filter: `brightness(${slide.backgroundBrightness}%) blur(${slide.backgroundBlur * 0.1}px)`,
                  }}
                />
              )}
            </div>

            {/* Slide number */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
              {index + 1}
            </div>

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateSlide(index);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Duplicate Slide"
              >
                <Copy size={14} />
              </button>
              {slides.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(index);
                  }}
                  className="p-2 rounded-full bg-red-500/50 hover:bg-red-500/70 text-white transition-colors"
                  title="Delete Slide"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
