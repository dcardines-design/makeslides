'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, FabricImage, Textbox, Shadow, Rect } from 'fabric';
import { useEditorStore, TextElement } from '@/stores/editorStore';

// TikTok dimensions (9:16 aspect ratio)
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// Type for Fabric objects with custom data
interface FabricObjectWithData extends Textbox {
  data?: { id: string };
}

// Store textbox and linked background rect
interface ObjectEntry {
  textbox: Textbox;
  bgRect?: Rect;
}

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const objectMapRef = useRef<Map<string, ObjectEntry>>(new Map());
  const copiedElementRef = useRef<TextElement | null>(null);

  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    zoom,
    setZoom,
    updateElement,
    selectElement,
    addElement,
    deleteElement,
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];

  // Create a stable key for when we need full re-render (structure changes)
  const slideStructureKey = useMemo(() => {
    const styleProps = currentSlide.elements.map(e =>
      `${e.outlineStyle || 'none'}-${e.outlineColor || '#000000'}-${e.outlineSize || 4}-${e.paddingX || 32}-${e.paddingY || 24}-${e.opacity || 80}`
    ).join(',');
    return `${currentSlide.id}-${currentSlide.backgroundImage}-${currentSlide.elements.map(e => e.id).join(',')}-${styleProps}`;
  }, [currentSlide.id, currentSlide.backgroundImage, currentSlide.elements]);

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

  // Handle copy/paste keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Copy: Cmd+C / Ctrl+C
      if (modifier && e.key === 'c' && selectedElementId) {
        const element = currentSlide.elements.find(el => el.id === selectedElementId);
        if (element) {
          copiedElementRef.current = { ...element };
        }
      }

      // Paste: Cmd+V / Ctrl+V
      if (modifier && e.key === 'v' && copiedElementRef.current) {
        const copied = copiedElementRef.current;
        // Offset position slightly so it's visible
        const { id: _id, ...rest } = copied;
        addElement({
          ...rest,
          x: copied.x + 30,
          y: copied.y + 30,
        });
      }

      // Delete: Delete or Backspace (only when not editing text)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        const activeElement = document.activeElement;
        const isEditingText = activeElement?.tagName === 'TEXTAREA' ||
                              activeElement?.tagName === 'INPUT' ||
                              (activeElement as HTMLElement)?.isContentEditable;
        if (!isEditingText) {
          e.preventDefault();
          deleteElement(selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, currentSlide.elements, addElement, deleteElement]);

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

    // Sync background rect position while dragging
    canvas.on('object:moving', (e) => {
      const obj = e.target as FabricObjectWithData | undefined;
      if (obj?.data?.id) {
        const entry = objectMapRef.current.get(obj.data.id);
        if (entry?.bgRect) {
          entry.bgRect.set({
            left: obj.left,
            top: obj.top,
          });
          entry.bgRect.setCoords();
          canvas.requestRenderAll();
        }
      }
    });

    // Handle object modifications
    canvas.on('object:modified', (e) => {
      const obj = e.target as FabricObjectWithData | undefined;
      if (obj?.data?.id) {
        const scaleX = obj.scaleX || 1;
        const scaleY = obj.scaleY || 1;
        const entry = objectMapRef.current.get(obj.data.id);

        // If scaled, convert to font size change instead of distortion
        if (scaleX !== 1 || scaleY !== 1) {
          const avgScale = (scaleX + scaleY) / 2;

          // Update textbox font size
          if (entry?.textbox) {
            const currentFontSize = entry.textbox.fontSize || 36;
            entry.textbox.set('fontSize', Math.round(currentFontSize * avgScale));
          }

          // Reset scale to prevent distortion
          obj.set({
            scaleX: 1,
            scaleY: 1,
          });
          obj.setCoords();
          canvas.renderAll();
        }

        // Sync bgRect position on modification
        if (entry?.bgRect) {
          entry.bgRect.set({
            left: obj.left,
            top: obj.top,
          });
          entry.bgRect.setCoords();
        }

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

    // Helper to convert hex color to rgba with transparency
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Add text elements
    for (const element of currentSlide.elements) {
      // Determine outline style settings
      const outlineStyle = element.outlineStyle || 'none';
      const hasStroke = outlineStyle === 'outline';
      const hasBox = outlineStyle === 'box';
      const outlineSize = element.outlineSize || 4;
      const outlineColor = element.outlineColor || '#000000';

      if (element.type === 'badge' && element.backgroundColor && !hasBox) {
        // Create badge with rounded rectangle background (legacy style)
        const textbox = new Textbox(element.text, {
          left: element.x,
          top: element.y,
          width: element.width,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          textAlign: element.textAlign,
          originX: 'center',
          originY: 'center',
          ...(hasStroke && {
            stroke: outlineColor,
            strokeWidth: outlineSize,
            paintFirst: 'stroke',
          }),
        });

        // Force text dimension calculation for multi-line text
        textbox.initDimensions();

        // Calculate text dimensions for background
        const paddingX = 32;
        const paddingY = 24;
        const textHeight = textbox.calcTextHeight();
        const textWidth = textbox.width || element.width;

        // Create rounded rectangle background
        const bgRect = new Rect({
          left: element.x,
          top: element.y,
          width: textWidth + paddingX * 2,
          height: textHeight + paddingY * 2,
          fill: element.backgroundColor,
          rx: 12,
          ry: 12,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });

        // Store custom data and reference
        (textbox as FabricObjectWithData).data = { id: element.id };
        objectMapRef.current.set(element.id, { textbox, bgRect });

        // Add background first, then text
        canvas.add(bgRect);
        canvas.add(textbox);
      } else if (hasBox) {
        // Box style - separate background rect linked to textbox
        const textbox = new Textbox(element.text, {
          left: element.x,
          top: element.y,
          width: element.width,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          textAlign: element.textAlign,
          originX: 'center',
          originY: 'center',
        });

        // Force text dimension calculation for multi-line text
        textbox.initDimensions();

        const paddingX = element.paddingX || 32;
        const paddingY = element.paddingY || 24;
        const opacity = (element.opacity || 80) / 100;
        const textHeight = textbox.calcTextHeight();
        const textWidth = textbox.width || element.width;

        const bgRect = new Rect({
          left: element.x,
          top: element.y,
          width: textWidth + paddingX * 2,
          height: textHeight + paddingY * 2,
          fill: hexToRgba(outlineColor, opacity),
          rx: 16,
          ry: 16,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });

        // Store custom data and reference
        (textbox as FabricObjectWithData).data = { id: element.id };
        objectMapRef.current.set(element.id, { textbox, bgRect });

        // Add background first, then text
        canvas.add(bgRect);
        canvas.add(textbox);
      } else {
        // Body text or intro title (no box)
        const textbox = new Textbox(element.text, {
          left: element.x,
          top: element.y,
          width: element.width,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          textAlign: element.textAlign,
          originX: 'center',
          ...(hasStroke && {
            stroke: outlineColor,
            strokeWidth: outlineSize,
            paintFirst: 'stroke',
          }),
        });

        // Store custom data and reference
        (textbox as FabricObjectWithData).data = { id: element.id };
        objectMapRef.current.set(element.id, { textbox });

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
      const entry = objectMapRef.current.get(selectedElementId);
      if (entry) {
        canvas.setActiveObject(entry.textbox);
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
      const entry = objectMapRef.current.get(element.id);
      if (entry) {
        const { textbox, bgRect } = entry;
        const outlineStyle = element.outlineStyle || 'none';
        const hasStroke = outlineStyle === 'outline';
        const outlineSize = element.outlineSize || 4;
        const outlineColor = element.outlineColor || '#000000';

        // Update textbox properties
        textbox.set({
          text: element.text,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fill: element.fill,
          left: element.x,
          top: element.y,
          stroke: hasStroke ? outlineColor : undefined,
          strokeWidth: hasStroke ? outlineSize : 0,
          paintFirst: hasStroke ? 'stroke' : 'fill',
        });
        textbox.setCoords();

        // Sync bgRect position if exists
        if (bgRect) {
          bgRect.set({
            left: element.x,
            top: element.y,
          });
          bgRect.setCoords();
        }
      }
    }

    canvas.requestRenderAll();
  }, [currentSlide.elements]);

  // Handle selection separately to avoid re-rendering
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedElementId) return;

    const entry = objectMapRef.current.get(selectedElementId);
    if (entry) {
      canvas.setActiveObject(entry.textbox);
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
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center"
      onDoubleClick={(e) => e.preventDefault()}
    >
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
