'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, FabricImage, Textbox, Shadow } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';

// TikTok dimensions (9:16 aspect ratio)
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// Type for Fabric objects with custom data
interface FabricObjectWithData extends Textbox {
  data?: { id: string };
}

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const objectMapRef = useRef<Map<string, Textbox>>(new Map());

  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    zoom,
    setZoom,
    updateElement,
    selectElement,
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];

  // Create a stable key for when we need full re-render (structure changes)
  const slideStructureKey = useMemo(() => {
    return `${currentSlide.id}-${currentSlide.backgroundImage}-${currentSlide.elements.map(e => e.id).join(',')}`;
  }, [currentSlide.id, currentSlide.backgroundImage, currentSlide.elements.map(e => e.id).join(',')]);

  // Calculate zoom to fill container
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const calculateZoom = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Use height to fill since container has aspect ratio
      const newZoom = rect.height / CANVAS_HEIGHT;
      setZoom(Math.max(0.15, newZoom));
    };

    calculateZoom();

    const resizeObserver = new ResizeObserver(calculateZoom);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [setZoom]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#1a1a1a',
      selection: true,
      enableRetinaScaling: true,
    });

    fabricRef.current = canvas;

    // Handle selection
    canvas.on('selection:created', (e) => {
      const selected = e.selected?.[0] as FabricObjectWithData | undefined;
      if (selected?.data?.id) {
        selectElement(selected.data.id);
      }
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected?.[0] as FabricObjectWithData | undefined;
      if (selected?.data?.id) {
        selectElement(selected.data.id);
      }
    });

    canvas.on('selection:cleared', () => {
      selectElement(null);
    });

    // Handle object modifications
    canvas.on('object:modified', (e) => {
      const obj = e.target as FabricObjectWithData | undefined;
      if (obj?.data?.id) {
        updateElement(obj.data.id, {
          x: obj.left || 0,
          y: obj.top || 0,
          width: (obj.width || 0) * (obj.scaleX || 1),
        });
      }
    });

    canvas.on('text:changed', (e) => {
      const obj = e.target as FabricObjectWithData | undefined;
      if (obj?.data?.id) {
        updateElement(obj.data.id, {
          text: obj.text || '',
        });
      }
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Render current slide (only on structure changes)
  const renderSlide = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Clear canvas and object map
    canvas.clear();
    objectMapRef.current.clear();
    canvas.backgroundColor = '#1a1a1a';

    // Add background image if exists
    if (currentSlide.backgroundImage) {
      try {
        const img = await FabricImage.fromURL(currentSlide.backgroundImage, {
          crossOrigin: 'anonymous',
        });

        // Get actual image dimensions
        const imgWidth = img.width || img.getScaledWidth() || 1;
        const imgHeight = img.height || img.getScaledHeight() || 1;

        // Scale to cover canvas
        const scaleX = CANVAS_WIDTH / imgWidth;
        const scaleY = CANVAS_HEIGHT / imgHeight;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });

        canvas.add(img);
        canvas.sendObjectToBack(img);
      } catch (error) {
        console.error('Failed to load background image:', error);
      }
    }

    // Add text elements
    for (const element of currentSlide.elements) {
      if (element.type === 'badge' && element.backgroundColor) {
        // Create badge with background (for step slides)
        const textbox = new Textbox(element.text, {
          left: element.x,
          top: element.y,
          width: element.width,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          textAlign: element.textAlign,
          backgroundColor: element.backgroundColor,
          padding: 24,
          originX: 'center',
        });

        // Store custom data and reference
        (textbox as FabricObjectWithData).data = { id: element.id };
        objectMapRef.current.set(element.id, textbox);
        canvas.add(textbox);
      } else {
        // Body text or intro title (with shadow, no background)
        const textbox = new Textbox(element.text, {
          left: element.x,
          top: element.y,
          width: element.width,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          textAlign: element.textAlign,
          originX: 'center',
        });

        // Store custom data and reference
        (textbox as FabricObjectWithData).data = { id: element.id };
        objectMapRef.current.set(element.id, textbox);

        if (element.shadowEnabled) {
          textbox.shadow = new Shadow({
            color: 'rgba(0, 0, 0, 0.7)',
            blur: 15,
            offsetX: 0,
            offsetY: 4,
          });
        }

        canvas.add(textbox);
      }
    }

    canvas.renderAll();

    // Restore selection if needed
    if (selectedElementId) {
      const obj = objectMapRef.current.get(selectedElementId);
      if (obj) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
      }
    }
  }, [slideStructureKey]);

  // Full render only on structure changes
  useEffect(() => {
    renderSlide();
  }, [renderSlide]);

  // Update element properties in place (without full re-render)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    for (const element of currentSlide.elements) {
      const textbox = objectMapRef.current.get(element.id);
      if (textbox) {
        // Update properties without re-creating the object
        textbox.set({
          text: element.text,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          left: element.x,
          top: element.y,
          width: element.width,
        });
      }
    }

    canvas.renderAll();
  }, [currentSlide.elements]);

  // Handle selection separately to avoid re-rendering
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedElementId) return;

    const objects = canvas.getObjects();
    const selectedObj = objects.find(
      (obj) => (obj as FabricObjectWithData).data?.id === selectedElementId
    );
    if (selectedObj) {
      canvas.setActiveObject(selectedObj);
      canvas.renderAll();
    }
  }, [selectedElementId]);

  // Apply zoom using CSS transform for sharp rendering
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Keep canvas at full resolution, use CSS to scale
    canvas.setZoom(1);
    canvas.setDimensions({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    });
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden flex items-center justify-center">
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
