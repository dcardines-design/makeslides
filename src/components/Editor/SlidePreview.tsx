'use client';

import { useEffect, useRef } from 'react';
import { Slide } from '@/stores/editorStore';

// TikTok dimensions (9:16 aspect ratio)
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

interface SlidePreviewProps {
  slide: Slide | null;
  scale?: number;
  isSelected?: boolean;
}

export default function SlidePreview({ slide, scale = 0.35, isSelected = false }: SlidePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slide) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH * scale;
    canvas.height = CANVAS_HEIGHT * scale;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale context
    ctx.scale(scale, scale);

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

        // Draw text elements
        drawTextElements(ctx, slide);
      };
      img.src = slide.backgroundImage;
    } else {
      // Draw text elements without background
      drawTextElements(ctx, slide);
    }
  }, [slide, scale]);

  const drawTextElements = (ctx: CanvasRenderingContext2D, slide: Slide) => {
    for (const element of slide.elements) {
      ctx.save();

      if (element.type === 'badge') {
        // Draw badge background
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        const metrics = ctx.measureText(element.text);
        const textWidth = Math.min(metrics.width, element.width);
        const padding = 20;

        ctx.fillStyle = element.backgroundColor || 'rgba(255, 255, 255, 0.9)';
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
        let y = element.y;
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
        y = element.y - totalHeight / 2 + lineHeight / 2;

        for (const l of lines) {
          ctx.fillText(l, element.x, y);
          y += lineHeight;
        }
      }

      ctx.restore();
    }
  };

  if (!slide) {
    return (
      <div
        className={`rounded-xl overflow-hidden ${isSelected ? 'ring-2 ring-[#3B1DD1]' : ''}`}
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          backgroundColor: '#1a1a1a',
        }}
      />
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${isSelected ? 'ring-2 ring-[#3B1DD1]' : ''}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
