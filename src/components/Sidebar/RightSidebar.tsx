'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { ChevronUp, ChevronDown, Loader2, Plus, X, Link, Bookmark, Type } from 'lucide-react';
import TextStyleModal from '@/components/Editor/TextStyleModal';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
}

interface CollectionImage {
  id: string;
  url: string;
}

export default function RightSidebar() {
  const {
    slides,
    currentSlideIndex,
    selectedElementId,
    updateElement,
    setBackgroundImage,
    selectedFont,
    setSelectedFont,
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide?.elements.find(
    (el) => el.id === selectedElementId
  );

  const [textValue, setTextValue] = useState('');
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<'unsplash' | 'pinterest' | 'collection'>('unsplash');
  const [textExpanded, setTextExpanded] = useState(true);
  const [bgExpanded, setBgExpanded] = useState(true);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

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
  ];

  const fontSizes = [16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

  // Collection state - fetched from Supabase
  const [collection, setCollection] = useState<CollectionImage[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Pinterest state
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [pinterestLoading, setPinterestLoading] = useState(false);

  // Text Style Modal state
  const [textStyleModalOpen, setTextStyleModalOpen] = useState(false);

  // Fetch collection from Supabase on mount
  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      if (!response.ok) {
        // Supabase not configured, use empty collection
        setCollection([]);
        return;
      }
      const data = await response.json();
      setCollection(data.images || []);
    } catch (error) {
      console.error('Failed to fetch collection:', error);
      setCollection([]);
    } finally {
      setCollectionLoading(false);
    }
  };

  // Update textValue when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setTextValue(selectedElement.text);
    } else {
      setTextValue('');
    }
  }, [selectedElement?.id, selectedElement?.text]);

  // Close font dropdown when clicking outside
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

  useEffect(() => {
    if (activeSource === 'unsplash') {
      fetchImages('aesthetic shopping lifestyle');
    } else if (activeSource === 'pinterest') {
      setImages([]); // Clear images when switching to Pinterest
    }
  }, [activeSource]);

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

  const fetchPinterestImages = async (url: string) => {
    if (!url.includes('pinterest.com')) {
      alert('Please enter a valid Pinterest URL');
      return;
    }

    setPinterestLoading(true);
    try {
      const response = await fetch(`/api/pinterest?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setImages(data.results);
        // Auto-save all Pinterest images to collection
        for (const img of data.results) {
          await saveToCollection(img.urls.regular);
        }
      } else {
        alert('No images found. Try a different Pinterest URL.');
      }
    } catch (error) {
      console.error('Failed to fetch Pinterest images:', error);
      alert('Failed to fetch Pinterest images. Try copying the URL again.');
    } finally {
      setPinterestLoading(false);
    }
  };

  const handlePinterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinterestUrl.trim()) {
      fetchPinterestImages(pinterestUrl);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextValue(newText);
    if (selectedElement) {
      updateElement(selectedElement.id, { text: newText });
    }
  };

  const addToCollection = async () => {
    if (!newUrl.trim()) return;

    // Basic URL validation
    const url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.image) {
          setCollection([data.image, ...collection.filter(img => img.id !== data.image.id)]);
        }
      } else {
        // Fallback: add locally without Supabase
        const newImage = { id: Date.now().toString(), url };
        setCollection([newImage, ...collection]);
      }
    } catch (error) {
      console.error('Failed to add to collection:', error);
      // Fallback: add locally
      const newImage = { id: Date.now().toString(), url };
      setCollection([newImage, ...collection]);
    }

    setNewUrl('');
    setShowUrlInput(false);
  };

  const removeFromCollection = async (id: string) => {
    try {
      await fetch('/api/collection', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setCollection(collection.filter(img => img.id !== id));
    } catch (error) {
      console.error('Failed to remove from collection:', error);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addToCollection();
    }
    if (e.key === 'Escape') {
      setShowUrlInput(false);
      setNewUrl('');
    }
  };

  const saveToCollection = async (imageUrl: string) => {
    // Check if already in collection
    if (collection.some(img => img.url === imageUrl)) {
      return; // Already saved
    }

    try {
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      });
      const data = await response.json();
      if (data.image) {
        setCollection([data.image, ...collection]);
      }
    } catch (error) {
      console.error('Failed to save to collection:', error);
    }
  };

  const isInCollection = (imageUrl: string) => {
    return collection.some(img => img.url === imageUrl);
  };

  return (
    <div className="w-72 bg-[#151515] flex flex-col h-full border border-[#2B2B2B]">
      {/* TEXT OVERLAY Section */}
      <div className="border-b border-[#1a1a1a]">
        <div className="flex items-center bg-[#1F1F1F] border-b border-[#2B2B2B]">
          <button
            onClick={() => setTextExpanded(!textExpanded)}
            className="flex-1 px-[20px] py-[14px] flex items-center justify-between text-[12px] text-[#8A8A8A] uppercase font-medium hover:text-[#aaa]"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.44px' }}
          >
            Text
            <ChevronUp
              size={16}
              className={`transition-transform ${textExpanded ? '' : 'rotate-180'}`}
            />
          </button>
          <button
            onClick={() => setTextStyleModalOpen(true)}
            className="px-3 py-2 mr-2 text-[#666] hover:text-white transition-colors"
            title="Text Style Settings"
          >
            <Type size={16} />
          </button>
        </div>
        {textExpanded && (
          <div className="px-4 py-4 space-y-3 border-b border-[#2B2B2B]">
            {/* Font Selector */}
            <div className="relative" ref={fontDropdownRef}>
              <button
                onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white text-left cursor-pointer focus:outline-none focus:border-[#3B1CD1] flex items-center justify-between"
                style={{ fontFamily: selectedFont }}
              >
                {selectedFont}
                <ChevronDown size={16} className={`text-[#666] transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {fontDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] overflow-hidden z-50 max-h-[200px] overflow-y-auto">
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        setSelectedFont(font);
                        currentSlide?.elements.forEach((el) => {
                          updateElement(el.id, { fontFamily: font });
                        });
                        setFontDropdownOpen(false);
                      }}
                      className={`w-full px-[14px] py-[10px] text-sm text-left hover:bg-[#2B2B2B] transition-colors ${
                        selectedFont === font ? 'bg-[#3B1FD1] text-white' : 'text-white'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font Size Selector */}
            <div className="relative">
              <select
                value={selectedElement?.fontSize || 36}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  if (selectedElement) {
                    updateElement(selectedElement.id, { fontSize: newSize });
                  }
                }}
                disabled={!selectedElement}
                className={`w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B1CD1] ${!selectedElement ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
            </div>

            {/* Selected Element Label */}
            {selectedElement && (
              <div className="text-[10px] text-[#8A8A8A] uppercase font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                Editing: {selectedElement.type === 'badge' ? 'Header' : 'Body'}
              </div>
            )}

            {/* Text Area */}
            <textarea
              value={textValue}
              onChange={handleTextChange}
              placeholder={selectedElement ? "Edit text..." : "Click a text element on canvas to edit"}
              disabled={!selectedElement}
              className={`w-full h-24 px-5 py-4 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-sm text-white placeholder-[#7D7D7D] resize-none focus:outline-none focus:border-[#3B1CD1] ${!selectedElement ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        )}
      </div>

      {/* IMAGE BACKGROUND Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <button
          onClick={() => setBgExpanded(!bgExpanded)}
          className="w-full px-[20px] py-[14px] flex items-center justify-between text-[12px] text-[#8A8A8A] uppercase font-medium hover:text-[#aaa] bg-[#1F1F1F] border-b border-[#2B2B2B]"
          style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.44px' }}
        >
          Image
          <ChevronUp
            size={16}
            className={`transition-transform ${bgExpanded ? '' : 'rotate-180'}`}
          />
        </button>

        {bgExpanded && (
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-4 py-4 border-t border-[#2B2B2B]">
            {/* Source Tabs */}
            <div className="mb-6">
              <label
                className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block text-left w-full"
                style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
              >
                Source
              </label>
              <div className="flex gap-2">
                {(['unsplash', 'pinterest', 'collection'] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => setActiveSource(source)}
                    className={`px-[14px] py-[8px] rounded-[10px] text-sm font-medium transition-colors border ${
                      activeSource === source
                        ? 'bg-[#3B1CD1] border-[#3B1CD1] text-white'
                        : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
                    }`}
                  >
                    {source === 'unsplash' ? 'Unsplash' : source === 'pinterest' ? 'Pinterest' : 'Collection'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search (for Unsplash) */}
            {activeSource === 'unsplash' && (
              <>
                <div className="mb-6">
                  <label className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block text-left w-full" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                    Search
                  </label>
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-sm text-white placeholder-[#7D7D7D] focus:outline-none focus:border-[#3B1CD1]"
                    />
                  </form>
                </div>

                {/* Results count */}
                <div className="mb-2">
                  <label className="text-[10px] text-[#8A8A8A] uppercase font-medium text-left w-full" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                    Results ({images.length})
                  </label>
                </div>

                {/* Image Grid */}
                <div className="pb-4">
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
                          className="aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-[#3B1DD1] transition-colors"
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
                </div>
              </>
            )}

            {/* Pinterest Tab */}
            {activeSource === 'pinterest' && (
              <>
                <div className="mb-6">
                  <label className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-[28px] block text-left w-full" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                    Pinterest URL
                  </label>
                  <form onSubmit={handlePinterestSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={pinterestUrl}
                      onChange={(e) => setPinterestUrl(e.target.value)}
                      placeholder="Paste Pinterest search URL..."
                      className="flex-1 px-5 py-3 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-sm text-white placeholder-[#7D7D7D] focus:outline-none focus:border-[#3B1CD1]"
                    />
                    <button
                      type="submit"
                      disabled={pinterestLoading || !pinterestUrl.trim()}
                      className="px-4 py-3 bg-[#3B1FD1] border border-[#6345FA] hover:bg-[#4B2DE1] rounded-[10px] text-white text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {pinterestLoading ? '...' : 'Go'}
                    </button>
                  </form>
                  <p className="text-[10px] text-[#555] mt-2">
                    Copy URL from Pinterest search or board page
                  </p>
                </div>

                {/* Results count and Save All */}
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10px] text-[#8A8A8A] uppercase font-medium text-left w-full" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                    Results ({images.length})
                  </label>
                  {images.length > 0 && (
                    <button
                      onClick={async () => {
                        for (const img of images) {
                          await saveToCollection(img.urls.regular);
                        }
                      }}
                      className="text-xs text-[#3B1DD1] hover:text-[#4B2DE1] font-medium"
                    >
                      Save All
                    </button>
                  )}
                </div>

                {/* Image Grid */}
                <div className="pb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {pinterestLoading ? (
                      <div className="col-span-3 py-8 flex items-center justify-center">
                        <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                      </div>
                    ) : images.length === 0 ? (
                      <div className="col-span-3 py-8 text-center text-[#555] text-sm">
                        <p>Paste a Pinterest URL above</p>
                        <p className="text-xs mt-1">e.g. pinterest.com/search/pins/?q=aesthetic</p>
                      </div>
                    ) : (
                      images.map((img) => {
                        // Use proxy for Pinterest images to avoid CORS
                        const isPinterest = img.urls.regular.includes('pinimg.com');
                        const bgUrl = isPinterest
                          ? `/api/proxy-image?url=${encodeURIComponent(img.urls.regular)}`
                          : img.urls.regular;
                        const thumbUrl = isPinterest
                          ? `/api/proxy-image?url=${encodeURIComponent(img.urls.small)}`
                          : img.urls.small;
                        const saved = isInCollection(img.urls.regular);

                        return (
                          <div key={img.id} className="relative group">
                            <button
                              onClick={() => setBackgroundImage(bgUrl)}
                              className="aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-[#3B1DD1] transition-colors w-full"
                            >
                              <img
                                src={thumbUrl}
                                alt={img.alt_description || 'Background'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </button>
                            {/* Save button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveToCollection(img.urls.regular);
                              }}
                              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                saved
                                  ? 'bg-[#3B1DD1] text-white opacity-100'
                                  : 'bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-[#3B1DD1]'
                              }`}
                              title={saved ? 'Saved to collection' : 'Save to collection'}
                            >
                              <Bookmark size={10} fill={saved ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Collection Tab */}
            {activeSource === 'collection' && (
              <>
                {/* Add URL Section */}
                <div className="mb-6">
                  <label className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-[28px] block text-left w-full" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                    Add Image URL
                  </label>
                  {showUrlInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={handleUrlKeyDown}
                        placeholder="Paste image URL..."
                        autoFocus
                        className="flex-1 px-5 py-3 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-sm text-white placeholder-[#7D7D7D] focus:outline-none focus:border-[#3B1CD1]"
                      />
                      <button
                        onClick={addToCollection}
                        className="px-3 py-3 bg-[#3B1FD1] border border-[#6345FA] hover:bg-[#4B2DE1] rounded-[10px] transition-colors"
                      >
                        <Plus size={16} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowUrlInput(true)}
                      className="w-full px-5 py-3 bg-[#0a0a0a] border border-dashed border-[#2B2B2B] rounded-[10px] text-sm text-[#7D7D7D] hover:text-white hover:border-[#3B1CD1] transition-colors flex items-center justify-center gap-2"
                    >
                      <Link size={14} />
                      Paste Pinterest/Image URL
                    </button>
                  )}
                </div>

                {/* Collection count */}
                <div className="mb-2">
                  <label className="text-[10px] text-[#8A8A8A] uppercase font-medium text-left w-full" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
                    Collection ({collection.length})
                  </label>
                </div>

                {/* Collection Grid */}
                <div className="pb-4">
                  {collectionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                    </div>
                  ) : collection.length === 0 ? (
                    <div className="text-center py-8 text-[#555] text-sm">
                      <p>No images yet</p>
                      <p className="text-xs mt-1">Paste image URLs from Pinterest or anywhere</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {collection.map((img) => {
                        // Use proxy for Pinterest images to avoid CORS
                        const isPinterest = img.url.includes('pinimg.com');
                        const displayUrl = isPinterest
                          ? `/api/proxy-image?url=${encodeURIComponent(img.url)}`
                          : img.url;

                        return (
                          <div key={img.id} className="relative group">
                            <button
                              onClick={() => setBackgroundImage(displayUrl)}
                              className="aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-[#3B1DD1] transition-colors w-full"
                            >
                              <img
                                src={displayUrl}
                                alt="Collection image"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1a1a" width="100" height="100"/><text fill="%23555" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">Error</text></svg>';
                                }}
                              />
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={() => removeFromCollection(img.id)}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Text Style Modal */}
      <TextStyleModal
        isOpen={textStyleModalOpen}
        onClose={() => setTextStyleModalOpen(false)}
      />
    </div>
  );
}
