import { create } from 'zustand';

export interface TextElement {
  id: string;
  type: 'badge' | 'body';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  backgroundColor?: string;
  textAlign: 'left' | 'center' | 'right';
  width: number;
  shadowEnabled: boolean;
}

export interface Slide {
  id: string;
  backgroundImage: string | null;
  backgroundBlur: number;
  backgroundBrightness: number;
  elements: TextElement[];
}

export interface GeneratedSlideContent {
  badge: string;
  body: string;
  backgroundImage?: string;
}

export interface TextStyleSettings {
  fontFamily: string;
  fontSize: number;
  outlineStyle: 'none' | 'outline' | 'highlight' | 'shadow';
}

interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  zoom: number;
  lastPrompt: string | null;
  lastStyle: string;
  isGenerating: boolean;
  selectedFont: string;
  headerStyle: TextStyleSettings;
  bodyStyle: TextStyleSettings;

  // Actions
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  setCurrentSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  setBackgroundImage: (url: string | null) => void;
  setBackgroundBlur: (blur: number) => void;
  setBackgroundBrightness: (brightness: number) => void;

  addElement: (element: Omit<TextElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<TextElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;

  setZoom: (zoom: number) => void;
  setSelectedFont: (font: string) => void;
  setHeaderStyle: (style: Partial<TextStyleSettings>) => void;
  setBodyStyle: (style: Partial<TextStyleSettings>) => void;

  getCurrentSlide: () => Slide;

  // AI Generation
  generateSlidesFromAI: (prompt: string, style?: string, collectionUrls?: string[]) => Promise<void>;
  generateSlidesFromContent: (content: GeneratedSlideContent[], prompt?: string, style?: string) => void;
  regenerateSlide: (index: number) => Promise<void>;
  loadFromHistory: (slides: GeneratedSlideContent[], prompt: string, style: string) => void;
  clearAllSlides: () => void;
}

const createDefaultSlide = (): Slide => ({
  id: crypto.randomUUID(),
  backgroundImage: null,
  backgroundBlur: 0,
  backgroundBrightness: 100,
  elements: [],
});

export const useEditorStore = create<EditorState>((set, get) => ({
  slides: [createDefaultSlide()],
  currentSlideIndex: 0,
  selectedElementId: null,
  zoom: 0.35,
  lastPrompt: null,
  lastStyle: 'casual',
  isGenerating: false,
  selectedFont: 'Inter',
  headerStyle: {
    fontFamily: 'Inter',
    fontSize: 48,
    outlineStyle: 'none',
  },
  bodyStyle: {
    fontFamily: 'Inter',
    fontSize: 36,
    outlineStyle: 'none',
  },

  addSlide: () => set((state) => ({
    slides: [...state.slides, createDefaultSlide()],
    currentSlideIndex: state.slides.length,
  })),

  deleteSlide: (index) => set((state) => {
    if (state.slides.length <= 1) return state;
    const newSlides = state.slides.filter((_, i) => i !== index);
    return {
      slides: newSlides,
      currentSlideIndex: Math.min(state.currentSlideIndex, newSlides.length - 1),
    };
  }),

  duplicateSlide: (index) => set((state) => {
    const slideToDuplicate = state.slides[index];
    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: crypto.randomUUID(),
      elements: slideToDuplicate.elements.map(el => ({
        ...el,
        id: crypto.randomUUID(),
      })),
    };
    const newSlides = [...state.slides];
    newSlides.splice(index + 1, 0, duplicatedSlide);
    return {
      slides: newSlides,
      currentSlideIndex: index + 1,
    };
  }),

  setCurrentSlide: (index) => set({
    currentSlideIndex: index,
    selectedElementId: null,
  }),

  reorderSlides: (fromIndex, toIndex) => set((state) => {
    const newSlides = [...state.slides];
    const [removed] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, removed);
    return { slides: newSlides };
  }),

  setBackgroundImage: (url) => set((state) => {
    const newSlides = [...state.slides];
    newSlides[state.currentSlideIndex] = {
      ...newSlides[state.currentSlideIndex],
      backgroundImage: url,
    };
    return { slides: newSlides };
  }),

  setBackgroundBlur: (blur) => set((state) => {
    const newSlides = [...state.slides];
    newSlides[state.currentSlideIndex] = {
      ...newSlides[state.currentSlideIndex],
      backgroundBlur: blur,
    };
    return { slides: newSlides };
  }),

  setBackgroundBrightness: (brightness) => set((state) => {
    const newSlides = [...state.slides];
    newSlides[state.currentSlideIndex] = {
      ...newSlides[state.currentSlideIndex],
      backgroundBrightness: brightness,
    };
    return { slides: newSlides };
  }),

  addElement: (element) => set((state) => {
    const newElement: TextElement = {
      ...element,
      id: crypto.randomUUID(),
    };
    const newSlides = [...state.slides];
    newSlides[state.currentSlideIndex] = {
      ...newSlides[state.currentSlideIndex],
      elements: [...newSlides[state.currentSlideIndex].elements, newElement],
    };
    return {
      slides: newSlides,
      selectedElementId: newElement.id,
    };
  }),

  updateElement: (id, updates) => set((state) => {
    const newSlides = [...state.slides];
    const currentSlide = newSlides[state.currentSlideIndex];
    newSlides[state.currentSlideIndex] = {
      ...currentSlide,
      elements: currentSlide.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    };
    return { slides: newSlides };
  }),

  deleteElement: (id) => set((state) => {
    const newSlides = [...state.slides];
    const currentSlide = newSlides[state.currentSlideIndex];
    newSlides[state.currentSlideIndex] = {
      ...currentSlide,
      elements: currentSlide.elements.filter(el => el.id !== id),
    };
    return {
      slides: newSlides,
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    };
  }),

  selectElement: (id) => set({ selectedElementId: id }),

  setZoom: (zoom) => set({ zoom }),
  setSelectedFont: (font) => set({ selectedFont: font }),
  setHeaderStyle: (style) => set((state) => ({
    headerStyle: { ...state.headerStyle, ...style },
  })),
  setBodyStyle: (style) => set((state) => ({
    bodyStyle: { ...state.bodyStyle, ...style },
  })),

  getCurrentSlide: () => {
    const state = get();
    return state.slides[state.currentSlideIndex];
  },

  generateSlidesFromAI: async (prompt: string, style: string = 'casual', collectionUrls?: string[]) => {
    set({ isGenerating: true });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          autoBackground: !collectionUrls?.length,
          collectionUrls
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      if (data.slides && data.slides.length > 0) {
        // If using collection, assign images to slides
        if (collectionUrls?.length) {
          data.slides.forEach((slide: GeneratedSlideContent, index: number) => {
            const url = collectionUrls[index % collectionUrls.length];
            // Proxy Pinterest images to avoid CORS issues
            const isPinterest = url.includes('pinimg.com');
            slide.backgroundImage = isPinterest
              ? `/api/proxy-image?url=${encodeURIComponent(url)}`
              : url;
          });
        }
        get().generateSlidesFromContent(data.slides, prompt, style);

        // Save to history
        try {
          await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              style,
              slides: data.slides,
            }),
          });
        } catch (historyError) {
          console.error('Failed to save to history:', historyError);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      set({ isGenerating: false });
    }
  },

  generateSlidesFromContent: (content, prompt, style) => {
    const { headerStyle, bodyStyle } = get();
    const newSlides: Slide[] = content.map((item, index) => {
      const isIntro = index === 0;

      return {
        id: crypto.randomUUID(),
        backgroundImage: item.backgroundImage || null,
        backgroundBlur: 0,
        backgroundBrightness: item.backgroundImage ? 70 : 100,
        elements: [
          {
            id: crypto.randomUUID(),
            type: isIntro ? 'body' as const : 'badge' as const,
            text: item.badge,
            x: 540,
            y: isIntro ? 800 : 650,
            fontSize: headerStyle.fontSize,
            fontFamily: headerStyle.fontFamily,
            fill: '#ffffff',
            backgroundColor: isIntro ? undefined : 'rgba(0, 0, 0, 0.6)',
            textAlign: 'center' as const,
            width: 900,
            shadowEnabled: true,
          },
          {
            id: crypto.randomUUID(),
            type: 'body' as const,
            text: item.body,
            x: 540,
            y: isIntro ? 1000 : 850,
            fontSize: bodyStyle.fontSize,
            fontFamily: bodyStyle.fontFamily,
            fill: '#ffffff',
            textAlign: 'center' as const,
            width: 900,
            shadowEnabled: true,
          },
        ],
      };
    });

    set({
      slides: newSlides,
      currentSlideIndex: 0,
      selectedElementId: null,
      lastPrompt: prompt || null,
      lastStyle: style || 'casual',
    });
  },

  regenerateSlide: async (index: number) => {
    const state = get();
    const { lastPrompt, lastStyle, slides } = state;

    if (!lastPrompt) {
      console.error('No prompt available for regeneration');
      return;
    }

    const totalSlides = slides.length;
    const slidePosition = index === 0 ? 'intro' : index === totalSlides - 1 ? 'takeaway' : `step ${index}`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${lastPrompt} - regenerate only the ${slidePosition} slide (slide ${index + 1} of ${totalSlides})`,
          style: lastStyle,
          autoBackground: !!slides[index].backgroundImage,
          singleSlide: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate');

      const data = await response.json();
      if (data.slides && data.slides.length > 0) {
        const regeneratedContent = data.slides[0];

        set((state) => {
          const newSlides = [...state.slides];
          const currentSlide = newSlides[index];

          // Update text elements with new content
          newSlides[index] = {
            ...currentSlide,
            backgroundImage: regeneratedContent.backgroundImage || currentSlide.backgroundImage,
            elements: currentSlide.elements.map((el) => {
              if (el.type === 'badge') {
                return { ...el, text: regeneratedContent.badge };
              }
              if (el.type === 'body') {
                return { ...el, text: regeneratedContent.body };
              }
              return el;
            }),
          };

          return { slides: newSlides };
        });
      }
    } catch (error) {
      console.error('Regeneration error:', error);
    }
  },

  loadFromHistory: (content, prompt, style) => set((state) => {
    const { headerStyle, bodyStyle } = state;
    const newSlides: Slide[] = content.map((item, index) => {
      const isIntro = index === 0;

      return {
        id: crypto.randomUUID(),
        backgroundImage: item.backgroundImage || null,
        backgroundBlur: 0,
        backgroundBrightness: item.backgroundImage ? 70 : 100,
        elements: [
          {
            id: crypto.randomUUID(),
            type: isIntro ? 'body' as const : 'badge' as const,
            text: item.badge,
            x: 540,
            y: isIntro ? 800 : 650,
            fontSize: headerStyle.fontSize,
            fontFamily: headerStyle.fontFamily,
            fill: '#ffffff',
            backgroundColor: isIntro ? undefined : 'rgba(0, 0, 0, 0.6)',
            textAlign: 'center' as const,
            width: 900,
            shadowEnabled: true,
          },
          {
            id: crypto.randomUUID(),
            type: 'body' as const,
            text: item.body,
            x: 540,
            y: isIntro ? 1000 : 850,
            fontSize: bodyStyle.fontSize,
            fontFamily: bodyStyle.fontFamily,
            fill: '#ffffff',
            textAlign: 'center' as const,
            width: 900,
            shadowEnabled: true,
          },
        ],
      };
    });

    return {
      slides: newSlides,
      currentSlideIndex: 0,
      selectedElementId: null,
      lastPrompt: prompt,
      lastStyle: style,
    };
  }),

  clearAllSlides: () => set({
    slides: [createDefaultSlide()],
    currentSlideIndex: 0,
    selectedElementId: null,
  }),
}));
