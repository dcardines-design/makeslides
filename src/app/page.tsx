'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LeftSidebar from '@/components/Sidebar/LeftSidebar';
import RightSidebar from '@/components/Sidebar/RightSidebar';
import SlidePicker from '@/components/Editor/SlidePicker';
import SlidePreview from '@/components/Editor/SlidePreview';
import { useEditorStore } from '@/stores/editorStore';

// Dynamic import for Canvas to avoid SSR issues with Fabric.js
const EditorCanvas = dynamic(() => import('@/components/Editor/Canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-[#525252]">Loading...</div>
    </div>
  ),
});

export default function Home() {
  const { slides, currentSlideIndex, zoom } = useEditorStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to current slide when it changes
  useEffect(() => {
    const slideEl = slideRefs.current[currentSlideIndex];
    if (slideEl && scrollContainerRef.current) {
      slideEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentSlideIndex]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Prompt */}
        <LeftSidebar />

        {/* Center area with canvases and thumbnails */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slide picker at top */}
          <div className="px-[50px] pt-[50px]">
            <SlidePicker />
          </div>

          {/* Canvases row - scrollable, full width, no right padding */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-start gap-[24px] overflow-x-auto pl-[50px] pb-[40px] mt-[40px] scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                ref={(el) => { slideRefs.current[index] = el; }}
                className="flex-shrink-0 h-full py-[2px]"
              >
                {index === currentSlideIndex ? (
                  <div className="h-full aspect-[9/16] rounded-[20px] overflow-hidden shadow-2xl outline outline-2 outline-[#3B1FD1]">
                    <EditorCanvas />
                  </div>
                ) : (
                  <div
                    className="h-full aspect-[9/16] rounded-[20px] overflow-hidden outline outline-1 outline-[#2B2B2B] cursor-pointer hover:outline-[#333] transition-colors"
                    onClick={() => useEditorStore.getState().setCurrentSlide(index)}
                  >
                    <SlidePreview slide={slide} scale={zoom} />
                  </div>
                )}
              </div>
            ))}
            {/* Right spacer */}
            <div className="flex-shrink-0 w-[50px]" />
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
