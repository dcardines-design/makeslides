'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface TextStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TextType = 'header' | 'body';
type OutlineStyle = 'none' | 'outline' | 'box';

export default function TextStyleModal({ isOpen, onClose }: TextStyleModalProps) {
  const {
    headerStyle,
    bodyStyle,
    setHeaderStyle,
    setBodyStyle,
    slides,
    updateElement
  } = useEditorStore();

  const [activeType, setActiveType] = useState<TextType>('header');
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [headerSettings, setHeaderSettings] = useState({
    fontFamily: headerStyle.fontFamily,
    fontSize: headerStyle.fontSize,
    outlineStyle: headerStyle.outlineStyle,
    outlineSize: headerStyle.outlineSize || 4,
    outlineColor: headerStyle.outlineColor || '#000000',
    paddingX: headerStyle.paddingX || 32,
    paddingY: headerStyle.paddingY || 24,
    opacity: headerStyle.opacity || 80,
  });
  const [bodySettings, setBodySettings] = useState({
    fontFamily: bodyStyle.fontFamily,
    fontSize: bodyStyle.fontSize,
    outlineStyle: bodyStyle.outlineStyle,
    outlineSize: bodyStyle.outlineSize || 4,
    outlineColor: bodyStyle.outlineColor || '#000000',
    paddingX: bodyStyle.paddingX || 32,
    paddingY: bodyStyle.paddingY || 24,
    opacity: bodyStyle.opacity || 80,
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
        outlineSize: headerStyle.outlineSize || 4,
        outlineColor: headerStyle.outlineColor || '#000000',
        paddingX: headerStyle.paddingX || 32,
        paddingY: headerStyle.paddingY || 24,
        opacity: headerStyle.opacity || 80,
      });
      setBodySettings({
        fontFamily: bodyStyle.fontFamily,
        fontSize: bodyStyle.fontSize,
        outlineStyle: bodyStyle.outlineStyle,
        outlineSize: bodyStyle.outlineSize || 4,
        outlineColor: bodyStyle.outlineColor || '#000000',
        paddingX: bodyStyle.paddingX || 32,
        paddingY: bodyStyle.paddingY || 24,
        opacity: bodyStyle.opacity || 80,
      });
    }
  }, [isOpen, headerStyle, bodyStyle]);

  const fonts = [
    'TikTok Sans',
    'Overused Grotesk',
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
      outlineSize: headerSettings.outlineSize,
      outlineColor: headerSettings.outlineColor,
      paddingX: headerSettings.paddingX,
      paddingY: headerSettings.paddingY,
      opacity: headerSettings.opacity,
    });
    setBodyStyle({
      fontFamily: bodySettings.fontFamily,
      fontSize: bodySettings.fontSize,
      outlineStyle: bodySettings.outlineStyle,
      outlineSize: bodySettings.outlineSize,
      outlineColor: bodySettings.outlineColor,
      paddingX: bodySettings.paddingX,
      paddingY: bodySettings.paddingY,
      opacity: bodySettings.opacity,
    });

    // Update all slides - first element is header, second is body
    slides.forEach((slide) => {
      slide.elements.forEach((el, index) => {
        const isHeader = index === 0;
        const settings = isHeader ? headerSettings : bodySettings;

        updateElement(el.id, {
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          outlineStyle: settings.outlineStyle,
          outlineSize: settings.outlineSize,
          outlineColor: settings.outlineColor,
          paddingX: settings.paddingX,
          paddingY: settings.paddingY,
          opacity: settings.opacity,
        });
      });
    });

    onClose();
  };

  const outlineColors = [
    '#000000',
    '#FFFFFF',
    '#7C3AED',
    '#F97316',
    '#EF4444',
    '#3B82F6',
    '#FBBF24',
    '#22C55E',
  ];

  const outlineStyles: { value: OutlineStyle; preview: React.ReactNode }[] = [
    {
      value: 'none',
      preview: <span className="text-white text-2xl font-bold">Tt</span>,
    },
    {
      value: 'outline',
      preview: (
        <span
          className="text-white text-2xl font-bold"
          style={{
            WebkitTextStroke: '3px #000000',
            paintOrder: 'stroke fill',
          }}
        >
          Tt
        </span>
      ),
    },
    {
      value: 'box',
      preview: (
        <span className="text-white text-xl font-bold bg-[#0a0a0a] px-3 py-1.5 rounded-lg">
          Tt
        </span>
      ),
    },
  ];

  // Generate preview style
  const getPreviewStyle = () => {
    const style: React.CSSProperties = {
      fontFamily: currentSettings.fontFamily,
    };

    if (currentSettings.outlineStyle === 'outline') {
      style.WebkitTextStroke = `${currentSettings.outlineSize}px ${currentSettings.outlineColor}`;
      style.paintOrder = 'stroke fill';
    }

    return style;
  };

  const getPreviewBgStyle = () => {
    if (currentSettings.outlineStyle === 'box') {
      const hex = currentSettings.outlineColor;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, ${currentSettings.opacity / 100})`,
        padding: `${currentSettings.paddingY}px ${currentSettings.paddingX}px`,
        borderRadius: '16px',
      };
    }
    return {};
  };

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
              className={`px-[14px] py-[8px] rounded-[10px] text-[12px] font-medium tracking-[1.44px] transition-all duration-150 border ${
                activeType === 'header'
                  ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                  : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
              }`}
            >
              HEADER
            </button>
            <button
              onClick={() => setActiveType('body')}
              className={`px-[14px] py-[8px] rounded-[10px] text-[12px] font-medium tracking-[1.44px] transition-all duration-150 border ${
                activeType === 'body'
                  ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                  : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
              }`}
            >
              BODY
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#2B2B2B] mb-6" />

          {/* Font Family & Font Size Row */}
          <div className="flex gap-3 mb-6">
            {/* Font Family */}
            <div className="flex-1">
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
                        className={`w-full px-[14px] py-[10px] text-sm text-left hover:bg-[#2B2B2B] transition-all duration-150 ${
                          currentSettings.fontFamily === font ? 'bg-[#2A1E66] text-white' : 'text-white'
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

            {/* Font Size */}
            <div className="w-24">
              <label
                className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
              >
                Font Size
              </label>
              <div className="relative">
                <select
                  value={currentSettings.fontSize}
                  onChange={(e) => setCurrentSettings({ ...currentSettings, fontSize: parseInt(e.target.value) })}
                  className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B1CD1]"
                >
                  {[16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72].map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
              </div>
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
                  className={`w-[90px] h-[90px] rounded-[10px] flex items-center justify-center transition-all duration-150 ${
                    currentSettings.outlineStyle === style.value
                      ? 'bg-[#2B2B2B] border-2 border-[#3B1DD1]'
                      : 'bg-[#151515] border border-[#2B2B2B] hover:border-[#3B1DD1]'
                  }`}
                >
                  {style.preview}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional fields based on outline style */}
          {currentSettings.outlineStyle === 'outline' && (
            <div className="flex gap-3 mb-6">
              {/* Outline Thickness */}
              <div className="flex-1">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Outline Thickness
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={currentSettings.outlineSize}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, outlineSize: parseInt(e.target.value) || 1 })}
                    className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white focus:outline-none focus:border-[#3B1CD1]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm pointer-events-none">px</span>
                </div>
              </div>

              {/* Opacity */}
              <div className="flex-1">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Opacity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentSettings.opacity}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, opacity: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white focus:outline-none focus:border-[#3B1CD1]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm pointer-events-none">%</span>
                </div>
              </div>
            </div>
          )}

          {currentSettings.outlineStyle === 'box' && (
            <>
              {/* Padding Row */}
              <div className="flex gap-3 mb-6">
                {/* Left Right Padding */}
                <div className="flex-1">
                  <label
                    className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                  >
                    Left Right Padding
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentSettings.paddingX}
                      onChange={(e) => setCurrentSettings({ ...currentSettings, paddingX: parseInt(e.target.value) || 0 })}
                      className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white focus:outline-none focus:border-[#3B1CD1]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm pointer-events-none">px</span>
                  </div>
                </div>

                {/* Top Bottom Padding */}
                <div className="flex-1">
                  <label
                    className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                  >
                    Top-Bottom Padding
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentSettings.paddingY}
                      onChange={(e) => setCurrentSettings({ ...currentSettings, paddingY: parseInt(e.target.value) || 0 })}
                      className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white focus:outline-none focus:border-[#3B1CD1]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm pointer-events-none">px</span>
                  </div>
                </div>
              </div>

              {/* Opacity */}
              <div className="mb-6">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Opacity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentSettings.opacity}
                    onChange={(e) => setCurrentSettings({ ...currentSettings, opacity: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white focus:outline-none focus:border-[#3B1CD1]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-sm pointer-events-none">%</span>
                </div>
              </div>
            </>
          )}

          {/* Outline Color */}
          <div className="mb-6">
            <label
              className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
            >
              Outline Color
            </label>
            <div className="px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-[14px] text-white mb-3">
              {currentSettings.outlineColor}
            </div>
            <div className="flex gap-2">
              {outlineColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentSettings({ ...currentSettings, outlineColor: color })}
                  className={`w-10 h-10 rounded-[8px] transition-all duration-150 ${
                    currentSettings.outlineColor === color
                      ? 'ring-2 ring-[#3B1DD1] ring-offset-2 ring-offset-[#0A0A0A]'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #2B2B2B' : 'none' }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="w-full h-24 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] flex items-center justify-center">
              <span
                className="text-white text-3xl font-bold"
                style={{
                  ...getPreviewStyle(),
                  ...getPreviewBgStyle(),
                }}
              >
                Tt
              </span>
            </div>
          </div>
        </div>

        {/* Save Button Container */}
        <div className="px-6 py-6 bg-[#151515] rounded-b-[20px]">
          <button
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] transition-all duration-150 hover:bg-[#4B2DE1]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
