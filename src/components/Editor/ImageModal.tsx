'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Plus } from 'lucide-react';

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

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
}

export default function ImageModal({ isOpen, onClose, onSave }: ImageModalProps) {
  const [activeSource, setActiveSource] = useState<'unsplash' | 'pinterest' | 'collection'>('unsplash');
  const [searchTags, setSearchTags] = useState('fitness, gym, faceless, aesthetic');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [collection, setCollection] = useState<CollectionImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch collection on mount
  useEffect(() => {
    if (isOpen) {
      fetchCollection();
      if (activeSource === 'unsplash') {
        fetchImages(searchTags);
      }
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchCollection = async () => {
    try {
      const response = await fetch('/api/collection');
      if (response.ok) {
        const data = await response.json();
        setCollection(data.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    } finally {
      setCollectionLoading(false);
    }
  };

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
    if (searchTags.trim()) {
      fetchImages(searchTags);
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
      } else {
        alert('No images found. Try a different Pinterest URL.');
      }
    } catch (error) {
      console.error('Failed to fetch Pinterest images:', error);
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

  const saveToCollection = async (imageUrl: string) => {
    if (collection.some(img => img.url === imageUrl)) return;

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

  const handleSave = () => {
    if (selectedImage) {
      onSave(selectedImage);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getImageUrl = (url: string) => {
    const isPinterest = url.includes('pinimg.com');
    return isPinterest ? `/api/proxy-image?url=${encodeURIComponent(url)}` : url;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-[#1F1F1F] rounded-[20px] w-[480px] max-w-[90vw] max-h-[85vh] shadow-2xl border border-[#2B2B2B] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#2B2B2B]">
          <h2
            className="text-[12px] text-[#8A8A8A] uppercase font-medium"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.44px' }}
          >
            Image
          </h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#0A0A0A]">
          {/* Source Tabs */}
          <div className="mb-6">
            <label
              className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
            >
              Source
            </label>
            <div className="flex gap-2">
              {(['unsplash', 'pinterest', 'collection'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => {
                    setActiveSource(source);
                    setSelectedImage(null);
                    if (source === 'unsplash' && images.length === 0) {
                      fetchImages(searchTags);
                    }
                  }}
                  className={`px-[14px] py-[8px] rounded-[10px] text-sm font-medium transition-colors border ${
                    activeSource === source
                      ? 'bg-[#3B1CD1] border-[#3B1CD1] text-white'
                      : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
                  }`}
                >
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Unsplash Tab */}
          {activeSource === 'unsplash' && (
            <>
              <div className="mb-4">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Photo Tags
                </label>
                <form onSubmit={handleSearch} className="flex items-stretch bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] overflow-hidden focus-within:border-[#3B1CD1]">
                  <input
                    type="text"
                    value={searchTags}
                    onChange={(e) => setSearchTags(e.target.value)}
                    placeholder="fitness, gym, faceless, aesthetic"
                    className="flex-1 px-4 py-2 bg-transparent text-sm text-white placeholder-[#7D7D7D] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-[14px] py-[8px] bg-[#3B1FD1] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#4B2DE1] transition-colors"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Search
                  </button>
                </form>
                <p className="text-[10px] text-[#555] mt-2">
                  We'll pull Unsplash photos using these tags
                </p>
              </div>

              <div className="mb-2">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Results ({images.length})
                </label>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {loading ? (
                  <div className="col-span-5 py-8 flex items-center justify-center">
                    <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                  </div>
                ) : (
                  images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.urls.regular)}
                      className={`aspect-square rounded-[8px] overflow-hidden border-2 transition-colors ${
                        selectedImage === img.urls.regular
                          ? 'border-[#3B1DD1]'
                          : 'border-transparent hover:border-[#3B1DD1]/50'
                      }`}
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

          {/* Pinterest Tab */}
          {activeSource === 'pinterest' && (
            <>
              <div className="mb-4">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Pinterest URL
                </label>
                <form onSubmit={handlePinterestSubmit} className="flex items-stretch bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] overflow-hidden focus-within:border-[#3B1CD1]">
                  <input
                    type="text"
                    value={pinterestUrl}
                    onChange={(e) => setPinterestUrl(e.target.value)}
                    placeholder="Paste Pinterest search URL..."
                    className="flex-1 px-4 py-2 bg-transparent text-sm text-white placeholder-[#7D7D7D] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={pinterestLoading}
                    className="px-[14px] py-[8px] bg-[#3B1FD1] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#4B2DE1] transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {pinterestLoading ? '...' : 'Go'}
                  </button>
                </form>
                <p className="text-[10px] text-[#555] mt-2">
                  Copy URL from Pinterest search or board page
                </p>
              </div>

              <div className="mb-2">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Results ({images.length})
                </label>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {pinterestLoading ? (
                  <div className="col-span-5 py-8 flex items-center justify-center">
                    <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                  </div>
                ) : images.length === 0 ? (
                  <div className="col-span-5 py-8 text-center text-[#555] text-sm">
                    Paste a Pinterest URL above
                  </div>
                ) : (
                  images.map((img) => {
                    const displayUrl = getImageUrl(img.urls.small);
                    const fullUrl = getImageUrl(img.urls.regular);
                    return (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.urls.regular)}
                        className={`aspect-square rounded-[8px] overflow-hidden border-2 transition-colors ${
                          selectedImage === img.urls.regular
                            ? 'border-[#3B1DD1]'
                            : 'border-transparent hover:border-[#3B1DD1]/50'
                        }`}
                      >
                        <img
                          src={displayUrl}
                          alt={img.alt_description || 'Background'}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Collection Tab */}
          {activeSource === 'collection' && (
            <>
              <div className="mb-4">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Add Image URL
                </label>
                <button
                  onClick={() => {
                    const url = prompt('Paste image URL:');
                    if (url) saveToCollection(url);
                  }}
                  className="w-full px-4 py-3 bg-transparent border border-dashed border-[#2B2B2B] rounded-[10px] text-sm text-[#7D7D7D] hover:text-white hover:border-[#3B1CD1] transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Paste Pinterest/Image URL
                </button>
              </div>

              <div className="mb-2">
                <label
                  className="text-[10px] text-[#8A8A8A] uppercase font-medium"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                >
                  Collection ({collection.length})
                </label>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-4">
                {collectionLoading ? (
                  <div className="col-span-5 py-8 flex items-center justify-center">
                    <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                  </div>
                ) : collection.length === 0 ? (
                  <div className="col-span-5 py-8 text-center text-[#555] text-sm">
                    No images in collection yet
                  </div>
                ) : (
                  collection.map((img) => {
                    const displayUrl = getImageUrl(img.url);
                    return (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.url)}
                        className={`aspect-square rounded-[8px] overflow-hidden border-2 transition-colors ${
                          selectedImage === img.url
                            ? 'border-[#3B1DD1]'
                            : 'border-transparent hover:border-[#3B1DD1]/50'
                        }`}
                      >
                        <img
                          src={displayUrl}
                          alt="Collection image"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Save to Collection button */}
          {selectedImage && activeSource !== 'collection' && (
            <button
              onClick={() => saveToCollection(selectedImage)}
              className="flex items-center gap-2 px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#2B2B2B] transition-colors"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <Plus size={12} />
              SAVE TO COLLECTION
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-[#151515] rounded-b-[20px] border-t border-[#2B2B2B]">
          <button
            onClick={handleSave}
            disabled={!selectedImage}
            className="w-full py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] transition-colors hover:bg-[#4B2DE1] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
