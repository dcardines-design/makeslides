'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface TextStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TextType = 'header' | 'body';
type OutlineStyle = 'none' | 'outline' | 'highlight' | 'shadow';

export default function TextStyleModal({ isOpen, onClose }: TextStyleModalProps) {
  const {
    headerStyle,
    bodyStyle,
    setHeaderStyle,
    setBodyStyle,
    slides,
    currentSlideIndex,
    updateElement
  } = useEditorStore();

  const [activeType, setActiveType] = useState<TextType>('header');
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [headerSettings, setHeaderSettings] = useState({
    fontFamily: headerStyle.fontFamily,
    fontSize: headerStyle.fontSize,
    outlineStyle: headerStyle.outlineStyle,
  });
  const [bodySettings, setBodySettings] = useState({
    fontFamily: bodyStyle.fontFamily,
    fontSize: bodyStyle.fontSize,
    outlineStyle: bodyStyle.outlineStyle,
  });

  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync local state with store when modal opens
  useEffect(() => {
    if (isOpen) {
      setHeaderSettings({
        fontFamily: headerStyle.fontFamily,
        fontSize: headerStyle.fontSize,
        outlineStyle: headerStyle.outlineStyle,
      });
      setBodySettings({
        fontFamily: bodyStyle.fontFamily,
        fontSize: bodyStyle.fontSize,
        outlineStyle: bodyStyle.outlineStyle,
      });
    }
  }, [isOpen, headerStyle, bodyStyle]);

  const fonts = [
    'Inter',
    'Space Grotesk',
    'Poppins',
    'Montserrat',
    'Roboto',
    'Open Sans',
    'Lato',
    'Outfit',
    'Sora',
    'DM Sans',
    'Work Sans',
    'Nunito',
    'Quicksand',
    'Raleway',
    'Oswald',
    'Bebas Neue',
    'Archivo Black',
    'Playfair Display',
    'Merriweather',
    'Overused Grotesk',
  ];

  const currentSettings = activeType === 'header' ? headerSettings : bodySettings;
  const setCurrentSettings = activeType === 'header' ? setHeaderSettings : setBodySettings;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setFontDropdownOpen(false);
      }
    };

    if (fontDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fontDropdownOpen]);

  // Close modal when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSaveSettings = () => {
    // Save settings to store
    setHeaderStyle({
      fontFamily: headerSettings.fontFamily,
      fontSize: headerSettings.fontSize,
      outlineStyle: headerSettings.outlineStyle,
    });
    setBodyStyle({
      fontFamily: bodySettings.fontFamily,
      fontSize: bodySettings.fontSize,
      outlineStyle: bodySettings.outlineStyle,
    });

    const currentSlide = slides[currentSlideIndex];

    // Update all elements of the matching type
    currentSlide?.elements.forEach((el) => {
      const isHeader = el.type === 'badge';
      const settings = isHeader ? headerSettings : bodySettings;

      updateElement(el.id, {
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
      });
    });

    onClose();
  };

  const outlineStyles: { value: OutlineStyle; preview: React.ReactNode }[] = [
    {
      value: 'none',
      preview: <span className="text-white text-2xl font-bold">Tt</span>,
    },
    {
      value: 'outline',
      preview: (
        <span
          className="text-2xl font-bold"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1px white',
          }}
        >
          Tt
        </span>
      ),
    },
    {
      value: 'highlight',
      preview: (
        <span className="text-2xl font-bold relative">
          <span className="text-yellow-400">T</span>
          <span className="text-white">t</span>
        </span>
      ),
    },
    {
      value: 'shadow',
      preview: (
        <span
          className="text-white text-2xl font-bold"
          style={{
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
          }}
        >
          Tt
        </span>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-[#1F1F1F] rounded-[20px] w-[480px] max-w-[90vw] shadow-2xl border border-[#2B2B2B]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[14px] bg-[#1F1F1F] border-b border-[#2B2B2B]">
          <h2
            className="text-[12px] text-[#8A8A8A] uppercase font-medium"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.44px' }}
          >
            Text Style
          </h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 bg-[#0A0A0A]">
          {/* Header/Body Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveType('header')}
              className={`px-[14px] py-[8px] rounded-[10px] text-sm font-medium transition-colors border ${
                activeType === 'header'
                  ? 'bg-[#3B1CD1] border-[#3B1CD1] text-white'
                  : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
              }`}
            >
              Header
            </button>
            <button
              onClick={() => setActiveType('body')}
              className={`px-[14px] py-[8px] rounded-[10px] text-sm font-medium transition-colors border ${
                activeType === 'body'
                  ? 'bg-[#3B1CD1] border-[#3B1CD1] text-white'
                  : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
              }`}
            >
              Body
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#2B2B2B] mb-6" />

          {/* Font Family */}
          <div className="mb-6">
            <label
              className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
            >
              Font Family
            </label>
            <div className="relative" ref={fontDropdownRef}>
              <button
                onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white text-left cursor-pointer focus:outline-none focus:border-[#3B1CD1] flex items-center justify-between"
                style={{ fontFamily: currentSettings.fontFamily }}
              >
                {currentSettings.fontFamily}
                <ChevronDown size={16} className={`text-[#666] transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {fontDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] overflow-hidden z-50 max-h-[200px] overflow-y-auto">
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        setCurrentSettings({ ...currentSettings, fontFamily: font });
                        setFontDropdownOpen(false);
                      }}
                      className={`w-full px-[14px] py-[10px] text-sm text-left hover:bg-[#2B2B2B] transition-colors ${
                        currentSettings.fontFamily === font ? 'bg-[#3B1FD1] text-white' : 'text-white'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Outline */}
          <div className="mb-6">
            <label
              className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
            >
              Outline
            </label>
            <div className="flex gap-3">
              {outlineStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCurrentSettings({ ...currentSettings, outlineStyle: style.value })}
                  className={`w-[90px] h-[90px] rounded-[10px] flex items-center justify-center transition-colors ${
                    currentSettings.outlineStyle === style.value
                      ? 'bg-[#2B2B2B] border-2 border-[#3B1FD1]'
                      : 'bg-[#151515] border border-[#2B2B2B] hover:border-[#3B1FD1]'
                  }`}
                >
                  {style.preview}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label
              className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
            >
              Font Size
            </label>
            <div className="relative inline-block">
              <select
                value={currentSettings.fontSize}
                onChange={(e) => setCurrentSettings({ ...currentSettings, fontSize: parseInt(e.target.value) })}
                className="px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B1CD1] pr-8"
              >
                {[16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72].map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Save/Generate Button Container */}
        <div className="px-6 py-6 bg-[#151515] rounded-b-[20px]">
          <button
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] transition-colors hover:bg-[#4B2DE1]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
