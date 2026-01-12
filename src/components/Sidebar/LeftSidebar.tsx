'use client';

import { useState, useEffect } from 'react';
import { useEditorStore, GeneratedSlideContent } from '@/stores/editorStore';
import { Sparkles, Loader2, ImageIcon, Clock, Trash2, Copy, Type, ChevronUp, X } from 'lucide-react';
import TextStyleModal from '@/components/Editor/TextStyleModal';
import ImageModal from '@/components/Editor/ImageModal';
import TikTokPanel from '@/components/TikTok/TikTokPanel';

interface CollectionImage {
  id: string;
  url: string;
}

interface HistoryEntry {
  id: string;
  prompt: string;
  style: string;
  slides: GeneratedSlideContent[];
  slide_count: number;
  created_at: string;
}

export default function LeftSidebar() {
  const [prompt, setPrompt] = useState('');
  const [useCollection, setUseCollection] = useState(false);
  const [collection, setCollection] = useState<CollectionImage[]>([]);
  const [selectedCollectionName, setSelectedCollectionName] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [textStyleModalOpen, setTextStyleModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [tiktokExpanded, setTiktokExpanded] = useState(true);
  const { generateSlidesFromAI, loadFromHistory, isGenerating, slides, setCollectionUrls } = useEditorStore();

  // Fetch collection and history on mount
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch('/api/collection');
        if (response.ok) {
          const data = await response.json();
          setCollection(data.images || []);
        }
      } catch (error) {
        console.error('Failed to fetch collection:', error);
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchCollection();
    fetchHistory();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Pass collection URLs if toggle is on
    const collectionUrls = useCollection ? collection.map(img => img.url) : undefined;
    await generateSlidesFromAI(prompt, 'casual', collectionUrls);
    setPrompt('');

    // Refresh history after generation
    const response = await fetch('/api/history');
    if (response.ok) {
      const data = await response.json();
      setHistory(data.history || []);
    }
  };

  const handleLoadHistory = (entry: HistoryEntry) => {
    loadFromHistory(entry.slides, entry.prompt, entry.style);
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setHistory(history.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };

  const handleCopyPrompt = (promptText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promptText);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="w-[282px] bg-[#151515] flex flex-col h-full border border-[#2B2B2B] p-4">
      {/* Generation History */}
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="flex items-center gap-2 text-[#8A8A8A] text-[10px] uppercase font-medium mb-[18px]" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
          <Clock size={12} />
          History
        </div>
        <div className="space-y-3">
        {historyLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={18} className="text-[#3B1DD1] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-[#555] text-sm">
            <p>No history yet. Generate some slides!</p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleLoadHistory(entry)}
              className="group relative text-sm px-3.5 py-3 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#3B1DD1] transition-all duration-150"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <p className="text-white text-sm line-clamp-2 pr-6">{entry.prompt}</p>
              <div className="flex items-center gap-2 mt-1.5 text-[#666] text-xs">
                <span>{entry.slide_count} slides</span>
                <span>•</span>
                <span>{formatDate(entry.created_at)}</span>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleCopyPrompt(entry.prompt, e)}
                  className="p-1 text-[#555] hover:text-white transition-colors"
                  title="Copy prompt"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={(e) => handleDeleteHistory(entry.id, e)}
                  className="p-1 text-[#555] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="flex flex-col gap-[14px]">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="gimme 7 slides, each slide gives budgeting tips"
          className="w-full h-24 px-[14px] py-[8px] bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-white text-[14px] placeholder-[#7D7D7D] resize-none focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        />

        {/* Icon buttons row */}
        <div className="flex gap-[10px]">
          {/* Text Style Button */}
          <button
            onClick={() => setTextStyleModalOpen(true)}
            className="flex-1 p-3 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-[#888] hover:text-white transition-all duration-150 flex items-center justify-center"
            title="Text Style Settings"
          >
            <Type size={18} />
          </button>

          {/* Image Style Button */}
          <button
            onClick={() => setImageModalOpen(true)}
            className={`flex-1 p-3 rounded-[10px] border flex items-center justify-center transition-all duration-150 ${
              useCollection
                ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
            }`}
            title="Image Settings"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Selected Collection Indicator */}
        {useCollection && (
          <div className="px-3 py-2 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-[#3B1DD1]" />
              <span className="text-[11px] text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {selectedCollectionName || `${collection.length} image${collection.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <button
              onClick={() => {
                setUseCollection(false);
                setSelectedCollectionName(null);
                setCollection([]);
              }}
              className="text-[#666] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#4B2DE1] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] tracking-[1.44px]"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              GENERATE
              <Sparkles size={14} />
            </>
          )}
        </button>
      </div>

      {/* TikTok Section */}
      <div className="mt-4 pt-4 border-t border-[#2B2B2B]">
        <button
          onClick={() => setTiktokExpanded(!tiktokExpanded)}
          className="w-full flex items-center justify-between text-[#8A8A8A] text-[10px] uppercase font-medium mb-3"
          style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
        >
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            TikTok
          </div>
          <ChevronUp
            size={12}
            className={`transition-transform ${tiktokExpanded ? '' : 'rotate-180'}`}
          />
        </button>
        {tiktokExpanded && (
          <TikTokPanel />
        )}
      </div>

      {/* Text Style Modal */}
      <TextStyleModal
        isOpen={textStyleModalOpen}
        onClose={() => setTextStyleModalOpen(false)}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSave={(imageUrl) => {
          // Set single image for generation
          setCollection([{ id: Date.now().toString(), url: imageUrl }]);
          setSelectedCollectionName(null);
          setUseCollection(true);
          setCollectionUrls([imageUrl]);
        }}
        onSaveCollection={(images, groupName) => {
          // Set collection images for generation
          setCollection(images.map((url, i) => ({ id: `${Date.now()}-${i}`, url })));
          setSelectedCollectionName(groupName);
          setUseCollection(true);
          setCollectionUrls(images);
        }}
      />
    </div>
  );
}
