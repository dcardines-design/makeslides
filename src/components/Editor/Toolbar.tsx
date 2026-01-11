'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import {
  Type,
  Download,
  ZoomIn,
  ZoomOut,
  Badge,
  ChevronDown,
  FileDown,
  FolderDown,
  Sparkles,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import AIGenerateModal from './AIGenerateModal';

export default function Toolbar() {
  const { slides, currentSlideIndex, zoom, setZoom, addElement } = useEditorStore();
  const [exporting, setExporting] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleAddBadge = () => {
    addElement({
      type: 'badge',
      text: 'STEP 1: YOUR TITLE HERE',
      x: 540,
      y: 400,
      fontSize: 48,
      fontFamily: 'Inter',
      fill: '#1a1a1a',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      textAlign: 'center',
      width: 800,
      shadowEnabled: false,
    });
  };

  const handleAddBodyText = () => {
    addElement({
      type: 'body',
      text: 'Add your description here.\nThis text will have a subtle shadow.',
      x: 540,
      y: 700,
      fontSize: 42,
      fontFamily: 'Inter',
      fill: '#ffffff',
      textAlign: 'center',
      width: 900,
      shadowEnabled: true,
    });
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 1));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.2));
  };

  const handleExportCurrent = async () => {
    setExporting(true);
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      // Create a temporary canvas at full resolution
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1080;
      tempCanvas.height = 1920;
      const ctx = tempCanvas.getContext('2d');

      if (ctx) {
        // Scale to draw at full resolution
        const scale = 1080 / canvas.width;
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);
      }

      const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `tiktok-slide-${currentSlideIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');

      const zip = new JSZip();
      const folder = zip.folder('tiktok-slides');
      if (!folder) return;

      // For now, we'll just export the current canvas state
      // A more complete solution would re-render each slide
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      // Export current slide
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1080;
      tempCanvas.height = 1920;
      const ctx = tempCanvas.getContext('2d');

      if (ctx) {
        const scale = 1080 / canvas.width;
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);
      }

      const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
      const base64Data = dataUrl.split(',')[1];

      for (let i = 0; i < slides.length; i++) {
        folder.file(`slide-${i + 1}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `tiktok-slides-${Date.now()}.zip`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="h-14 bg-[#141414] border-b border-[#262626] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">TikTok Slides</span>
          <span className="text-xs text-[#737373] bg-[#262626] px-2 py-0.5 rounded">
            {slides.length} slide{slides.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* AI Generate Button - Primary CTA */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all shadow-lg shadow-purple-500/25"
            title="Generate with AI"
          >
            <Sparkles size={18} />
            <span className="text-sm font-medium">AI Generate</span>
          </button>

          <div className="w-px h-6 bg-[#262626] mx-2" />

          <button
            onClick={handleAddBadge}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-white transition-colors"
            title="Add Header Badge"
          >
            <Badge size={18} />
            <span className="text-sm">Badge</span>
          </button>

          <button
            onClick={handleAddBodyText}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-white transition-colors"
            title="Add Body Text"
          >
            <Type size={18} />
            <span className="text-sm">Text</span>
          </button>

          <div className="w-px h-6 bg-[#262626] mx-2" />

          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>

          <span className="text-sm text-[#737373] w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>

          <div className="w-px h-6 bg-[#262626] mx-2" />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] text-white transition-colors disabled:opacity-50"
              >
                <Download size={18} />
                <span className="text-sm font-medium">
                  {exporting ? 'Exporting...' : 'Export'}
                </span>
                <ChevronDown size={14} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-[#1a1a1a] border border-[#262626] rounded-lg p-1 shadow-xl z-50"
                sideOffset={5}
                align="end"
              >
                <DropdownMenu.Item
                  onClick={handleExportCurrent}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white cursor-pointer outline-none hover:bg-[#262626] transition-colors"
                >
                  <FileDown size={16} />
                  Export Current Slide
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={handleExportAll}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white cursor-pointer outline-none hover:bg-[#262626] transition-colors"
                >
                  <FolderDown size={16} />
                  Export All as ZIP
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <AIGenerateModal open={aiModalOpen} onOpenChange={setAiModalOpen} />
    </>
  );
}
