'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Plus, Upload, Check } from 'lucide-react';

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
  group_name?: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  onSaveCollection?: (images: string[], groupName: string) => void;
}

export default function ImageModal({ isOpen, onClose, onSave, onSaveCollection }: ImageModalProps) {
  const [activeSource, setActiveSource] = useState<'pinterest' | 'collection'>('pinterest');
  const [searchTags, setSearchTags] = useState('fitness, gym, faceless, aesthetic');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [collection, setCollection] = useState<CollectionImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pinterestUrl, setPinterestUrl] = useState('');
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [pinterestSearchTerms, setPinterestSearchTerms] = useState('');
  const [savingAll, setSavingAll] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [collectionUrl, setCollectionUrl] = useState('');
  const [addingCollection, setAddingCollection] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch collection on mount
  useEffect(() => {
    if (isOpen) {
      fetchCollection();
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

  // Extract search terms from Pinterest URL
  const extractSearchTerms = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Extract from search query parameter
      const query = urlObj.searchParams.get('q');
      if (query) {
        return decodeURIComponent(query).replace(/\+/g, ' ');
      }
      // Extract from path like /search/pins/health-gym-aesthetic/
      const pathMatch = url.match(/\/search\/pins\/([^/?]+)/);
      if (pathMatch) {
        return decodeURIComponent(pathMatch[1]).replace(/-/g, ' ');
      }
      // Extract from board name
      const boardMatch = url.match(/pinterest\.com\/[^/]+\/([^/?]+)/);
      if (boardMatch && boardMatch[1] !== 'search') {
        return decodeURIComponent(boardMatch[1]).replace(/-/g, ' ');
      }
      return '';
    } catch {
      return '';
    }
  };

  const fetchPinterestImages = async (url: string) => {
    if (!url.includes('pinterest.com')) {
      alert('Please enter a valid Pinterest URL');
      return;
    }

    // Extract search terms from URL
    const terms = extractSearchTerms(url);
    setPinterestSearchTerms(terms);

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

  const saveAllToCollection = async () => {
    if (images.length === 0) return;

    setSavingAll(true);
    try {
      const urls = images.map(img => img.urls.regular);
      const response = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          groupName: pinterestSearchTerms || 'Pinterest Collection'
        }),
      });
      const data = await response.json();
      if (data.images) {
        // Refresh collection to show new images
        fetchCollection();
      }
    } catch (error) {
      console.error('Failed to save all to collection:', error);
    } finally {
      setSavingAll(false);
    }
  };

  // Add URL as new collection (fetches Pinterest images)
  const addUrlAsCollection = async (url: string) => {
    if (!url.trim()) return;

    setAddingCollection(true);
    try {
      // Check if it's a Pinterest URL
      if (url.includes('pinterest.com')) {
        // Extract search terms for group name
        const terms = extractSearchTerms(url);
        const groupName = terms || 'Pinterest Collection';

        // Fetch images from Pinterest
        const response = await fetch(`/api/pinterest?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          // Save all fetched images as a new collection group
          const urls = data.results.map((img: UnsplashImage) => img.urls.regular);
          const saveResponse = await fetch('/api/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls, groupName }),
          });
          const saveData = await saveResponse.json();
          if (saveData.images) {
            fetchCollection();
            setCollectionUrl('');
          }
        } else {
          alert('No images found. Try a different Pinterest URL.');
        }
      } else {
        // Direct image URL - save as single image
        await saveToCollection(url);
        setCollectionUrl('');
      }
    } catch (error) {
      console.error('Failed to add collection:', error);
    } finally {
      setAddingCollection(false);
    }
  };

  const handleSave = () => {
    // If collection groups are selected, save combined collection for generation
    if (activeSource === 'collection' && selectedGroups.length > 0 && onSaveCollection) {
      const grouped: { [key: string]: CollectionImage[] } = {};
      const ungrouped: CollectionImage[] = [];

      collection.forEach((img) => {
        if (img.group_name) {
          if (!grouped[img.group_name]) {
            grouped[img.group_name] = [];
          }
          grouped[img.group_name].push(img);
        } else {
          ungrouped.push(img);
        }
      });

      // Combine all selected groups
      let selectedImages: string[] = [];
      const groupNames: string[] = [];

      selectedGroups.forEach((group) => {
        if (group === '_ungrouped') {
          selectedImages = [...selectedImages, ...ungrouped.map(img => img.url)];
          groupNames.push('Saved Images');
        } else if (grouped[group]) {
          selectedImages = [...selectedImages, ...grouped[group].map(img => img.url)];
          groupNames.push(group);
        }
      });

      if (selectedImages.length > 0) {
        const combinedName = groupNames.length > 1
          ? `${groupNames.length} collections (${selectedImages.length} images)`
          : groupNames[0];
        onSaveCollection(selectedImages, combinedName);
        onClose();
        return;
      }
    }

    // Otherwise save single selected image
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
              {(['pinterest', 'collection'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => {
                    setActiveSource(source);
                    setSelectedImage(null);
                    setSelectedGroups([]);
                  }}
                  className={`px-[14px] py-[8px] rounded-[10px] text-[12px] font-medium tracking-[1.44px] transition-all duration-150 border ${
                    activeSource === source
                      ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                      : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
                  }`}
                >
                  {source.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

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
                <form onSubmit={handlePinterestSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={pinterestUrl}
                    onChange={(e) => setPinterestUrl(e.target.value)}
                    placeholder="Paste Pinterest search URL..."
                    className="flex-1 px-[14px] py-[8px] bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-[14px] text-white placeholder-[#7D7D7D] focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  />
                  <button
                    type="submit"
                    disabled={pinterestLoading}
                    className="px-[14px] py-[8px] rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#2B2B2B] transition-all duration-150 disabled:opacity-50"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {pinterestLoading ? '...' : 'GO'}
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
                        className={`aspect-square rounded-[8px] overflow-hidden border-2 transition-all duration-150 ${
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

              {/* Save All to Collection button */}
              {images.length > 0 && (
                <button
                  onClick={saveAllToCollection}
                  disabled={savingAll}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-white text-[11px] font-medium tracking-[1px] hover:bg-[#2B2B2B] transition-all duration-150 disabled:opacity-50"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {savingAll ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Plus size={12} />
                  )}
                  {savingAll ? 'SAVING...' : `SAVE ALL TO COLLECTION ${pinterestSearchTerms ? `(${pinterestSearchTerms})` : ''}`}
                </button>
              )}
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={collectionUrl}
                    onChange={(e) => setCollectionUrl(e.target.value)}
                    placeholder="Paste Pinterest/Image URL"
                    className="flex-1 px-[14px] py-[8px] bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-[14px] text-white placeholder-[#7D7D7D] focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addUrlAsCollection(collectionUrl);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={addingCollection || !collectionUrl.trim()}
                    onClick={() => addUrlAsCollection(collectionUrl)}
                    className="px-[14px] py-[8px] rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#2B2B2B] transition-all duration-150 disabled:opacity-50"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {addingCollection ? '...' : 'ADD'}
                  </button>
                </div>
              </div>

              {collectionLoading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 size={24} className="text-[#3B1DD1] animate-spin" />
                </div>
              ) : collection.length === 0 ? (
                <div className="py-8 text-center text-[#555] text-sm">
                  No images in collection yet
                </div>
              ) : (
                (() => {
                  // Group images by group_name
                  const grouped: { [key: string]: CollectionImage[] } = {};
                  const ungrouped: CollectionImage[] = [];

                  collection.forEach((img) => {
                    if (img.group_name) {
                      if (!grouped[img.group_name]) {
                        grouped[img.group_name] = [];
                      }
                      grouped[img.group_name].push(img);
                    } else {
                      ungrouped.push(img);
                    }
                  });

                  const groupNames = Object.keys(grouped);

                  return (
                    <div className="space-y-3">
                      {/* Grouped images */}
                      {groupNames.map((groupName) => (
                        <button
                          key={groupName}
                          onClick={() => {
                            // Toggle selection (multi-select)
                            setSelectedGroups(prev =>
                              prev.includes(groupName)
                                ? prev.filter(g => g !== groupName)
                                : [...prev, groupName]
                            );
                            setSelectedImage(null);
                          }}
                          className={`w-full p-3 rounded-[10px] border-2 transition-all duration-150 text-left ${
                            selectedGroups.includes(groupName)
                              ? 'border-[#3B1DD1] bg-[#1F1F1F]'
                              : 'border-[#2B2B2B] bg-[#1F1F1F] hover:border-[#3B1DD1]/50'
                          }`}
                        >
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {grouped[groupName].slice(0, 4).map((img) => {
                              const displayUrl = getImageUrl(img.url);
                              return (
                                <div
                                  key={img.id}
                                  className="aspect-square rounded-[8px] overflow-hidden bg-[#0a0a0a]"
                                >
                                  <img
                                    src={displayUrl}
                                    alt="Collection image"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              );
                            })}
                            {/* Fill empty slots */}
                            {grouped[groupName].length < 4 &&
                              Array(4 - grouped[groupName].length).fill(0).map((_, i) => (
                                <div
                                  key={`empty-${i}`}
                                  className="aspect-square rounded-[8px] bg-[#0a0a0a]"
                                />
                              ))
                            }
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{groupName}</p>
                            {selectedGroups.includes(groupName) && (
                              <div className="w-5 h-5 rounded-full bg-[#3B1DD1] flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}

                      {/* Ungrouped images */}
                      {ungrouped.length > 0 && (
                        <button
                          onClick={() => {
                            // Toggle selection (multi-select)
                            setSelectedGroups(prev =>
                              prev.includes('_ungrouped')
                                ? prev.filter(g => g !== '_ungrouped')
                                : [...prev, '_ungrouped']
                            );
                            setSelectedImage(null);
                          }}
                          className={`w-full p-3 rounded-[10px] border-2 transition-all duration-150 text-left ${
                            selectedGroups.includes('_ungrouped')
                              ? 'border-[#3B1DD1] bg-[#1F1F1F]'
                              : 'border-[#2B2B2B] bg-[#1F1F1F] hover:border-[#3B1DD1]/50'
                          }`}
                        >
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {ungrouped.slice(0, 4).map((img) => {
                              const displayUrl = getImageUrl(img.url);
                              return (
                                <div
                                  key={img.id}
                                  className="aspect-square rounded-[8px] overflow-hidden bg-[#0a0a0a]"
                                >
                                  <img
                                    src={displayUrl}
                                    alt="Collection image"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              );
                            })}
                            {ungrouped.length < 4 &&
                              Array(4 - ungrouped.length).fill(0).map((_, i) => (
                                <div
                                  key={`empty-${i}`}
                                  className="aspect-square rounded-[8px] bg-[#0a0a0a]"
                                />
                              ))
                            }
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{groupNames.length > 0 ? 'Other' : 'Saved Images'}</p>
                            {selectedGroups.includes('_ungrouped') && (
                              <div className="w-5 h-5 rounded-full bg-[#3B1DD1] flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      )}

                      {/* Upload Photos button */}
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-white text-[11px] font-medium tracking-[1px] hover:bg-[#2B2B2B] transition-all duration-150"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        <Upload size={12} />
                        UPLOAD PHOTOS
                      </button>
                    </div>
                  );
                })()
              )}
            </>
          )}

          {/* Save to Collection button */}
          {selectedImage && activeSource !== 'collection' && (
            <button
              onClick={() => saveToCollection(selectedImage)}
              className="flex items-center gap-2 px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#2B2B2B] transition-all duration-150"
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
            disabled={!selectedImage && !(activeSource === 'collection' && selectedGroups.length > 0)}
            className="w-full py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] transition-all duration-150 hover:bg-[#4B2DE1] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {activeSource === 'collection' && selectedGroups.length > 0
              ? `SAVE ${selectedGroups.length} COLLECTION${selectedGroups.length > 1 ? 'S' : ''}`
              : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  );
}
