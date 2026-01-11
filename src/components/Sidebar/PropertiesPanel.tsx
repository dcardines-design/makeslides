'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import {
  Image,
  Trash2,
  Sun,
  Search,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
} from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
}

export default function PropertiesPanel() {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    updateElement,
    deleteElement,
    setBackgroundImage,
    setBackgroundBrightness,
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide.elements.find(
    (el) => el.id === selectedElementId
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');

  // Load default images on mount
  useEffect(() => {
    fetchImages('aesthetic');
  }, []);

  const fetchImages = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchImages(searchQuery);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const quickSearches = ['aesthetic', 'coffee', 'nature', 'minimal', 'city', 'workspace'];

  return (
    <div className="w-80 bg-[#141414] border-l border-[#262626] flex flex-col overflow-hidden">
      {/* Background Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-[#262626]">
          <h3 className="text-sm font-medium text-white mb-3">Background</h3>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-[#262626] text-white'
                  : 'text-[#737373] hover:text-white'
              }`}
            >
              <Search size={14} className="inline mr-1" />
              Search
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-[#262626] text-white'
                  : 'text-[#737373] hover:text-white'
              }`}
            >
              <Upload size={14} className="inline mr-1" />
              Upload
            </button>
          </div>

          {activeTab === 'search' && (
            <>
              {/* Search input */}
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-sm text-white placeholder-[#737373] focus:outline-none focus:border-[#3B1DD1]"
                  />
                </div>
              </form>

              {/* Quick search tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {quickSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      fetchImages(tag);
                    }}
                    className="px-2 py-1 text-xs bg-[#262626] text-[#a3a3a3] rounded-md hover:bg-[#363636] hover:text-white transition-colors capitalize"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Image grid */}
              <div className="grid grid-cols-3 gap-2">
                {loading ? (
                  <div className="col-span-3 py-8 flex items-center justify-center">
                    <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                  </div>
                ) : (
                  images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setBackgroundImage(img.urls.regular)}
                      className="aspect-[9/16] rounded-md overflow-hidden border-2 border-transparent hover:border-[#3B1DD1] transition-colors"
                    >
                      <img
                        src={img.urls.small}
                        alt={img.alt_description || 'Background'}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'upload' && (
            <label className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-lg border-2 border-dashed border-[#262626] hover:border-[#404040] cursor-pointer transition-colors">
              <Image size={32} className="text-[#737373]" />
              <span className="text-sm text-[#737373]">
                Click to upload or drag & drop
              </span>
              <span className="text-xs text-[#525252]">PNG, JPG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Current background controls */}
          {currentSlide.backgroundImage && (
            <div className="mt-4 pt-4 border-t border-[#262626]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#737373]">Current Background</span>
                <button
                  onClick={() => setBackgroundImage(null)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              {/* Brightness */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[#737373] flex items-center gap-1">
                    <Sun size={14} />
                    Brightness
                  </label>
                  <span className="text-xs text-[#737373]">
                    {currentSlide.backgroundBrightness}%
                  </span>
                </div>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[currentSlide.backgroundBrightness]}
                  onValueChange={([value]) => setBackgroundBrightness(value)}
                  max={100}
                  min={20}
                  step={1}
                >
                  <Slider.Track className="bg-[#262626] relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-[#3B1DD1] rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md focus:outline-none" />
                </Slider.Root>
              </div>
            </div>
          )}
        </div>

        {/* Text Element Properties */}
        {selectedElement && (
          <div className="p-4 border-b border-[#262626]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                {selectedElement.type === 'badge' ? 'Badge' : 'Text'} Properties
              </h3>
              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#737373]">Font Size</label>
                <span className="text-xs text-[#737373]">
                  {selectedElement.fontSize}px
                </span>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[selectedElement.fontSize]}
                onValueChange={([value]) =>
                  updateElement(selectedElement.id, { fontSize: value })
                }
                max={120}
                min={16}
                step={2}
              >
                <Slider.Track className="bg-[#262626] relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-[#3B1DD1] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md focus:outline-none" />
              </Slider.Root>
            </div>

            {/* Text Color */}
            <div className="mb-4">
              <label className="text-xs text-[#737373] block mb-2">
                Text Color
              </label>
              <div className="flex gap-2">
                {['#ffffff', '#1a1a1a', '#3B1DD1', '#f59e0b', '#ef4444', '#10b981'].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() =>
                        updateElement(selectedElement.id, { fill: color })
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-colors ${
                        selectedElement.fill === color
                          ? 'border-[#3B1DD1]'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
                <input
                  type="color"
                  value={selectedElement.fill}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { fill: e.target.value })
                  }
                  className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border-0"
                />
              </div>
            </div>

            {/* Badge Background Color */}
            {selectedElement.type === 'badge' && (
              <div className="mb-4">
                <label className="text-xs text-[#737373] block mb-2">
                  Badge Background
                </label>
                <div className="flex gap-2">
                  {[
                    'rgba(255,255,255,0.95)',
                    'rgba(0,0,0,0.7)',
                    'rgba(139,92,246,0.9)',
                    'rgba(245,158,11,0.9)',
                  ].map((color, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        updateElement(selectedElement.id, {
                          backgroundColor: color,
                        })
                      }
                      className={`w-7 h-7 rounded-full border-2 transition-colors ${
                        selectedElement.backgroundColor === color
                          ? 'border-[#3B1DD1]'
                          : 'border-[#262626]'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Text Alignment */}
            <div className="mb-4">
              <label className="text-xs text-[#737373] block mb-2">
                Alignment
              </label>
              <div className="flex gap-1">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        textAlign: value as 'left' | 'center' | 'right',
                      })
                    }
                    className={`p-2 rounded-md transition-colors ${
                      selectedElement.textAlign === value
                        ? 'bg-[#3B1DD1] text-white'
                        : 'bg-[#262626] text-[#737373] hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow Toggle (for body text) */}
            {selectedElement.type === 'body' && (
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#737373]">Text Shadow</label>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      shadowEnabled: !selectedElement.shadowEnabled,
                    })
                  }
                  className={`w-10 h-6 rounded-full transition-colors ${
                    selectedElement.shadowEnabled ? 'bg-[#3B1DD1]' : 'bg-[#262626]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                      selectedElement.shadowEnabled ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {!selectedElement && !currentSlide.backgroundImage && (
          <div className="p-4 text-center text-[#737373] text-sm">
            Search for a background image or add text elements to get started
          </div>
        )}
      </div>
    </div>
  );
}
