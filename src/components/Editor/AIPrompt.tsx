'use client';

import { useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Sparkles } from 'lucide-react';

export default function AIPrompt() {
  const [aiPrompt, setAiPrompt] = useState('');
  const { generateSlidesFromAI, isGenerating } = useEditorStore();

  const handleGenerate = async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    await generateSlidesFromAI(aiPrompt, 'casual');
    setAiPrompt('');
  };

  return (
    <div className="flex justify-center pt-6 pb-4 px-4">
      <div className="flex items-center gap-3 w-full max-w-[700px]">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="gimme 7 slides, each slide gives budgeting tips"
          className="flex-1 h-14 px-6 bg-[#1a1a1a] border border-[#333] rounded-full text-white placeholder-[#666] focus:outline-none focus:border-[#3B1DD1] text-base"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleGenerate();
            }
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="h-14 px-8 rounded-full bg-[#3B1DD1] hover:bg-[#4B2DE1] text-white font-semibold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
          <Sparkles size={18} />
        </button>
      </div>
    </div>
  );
}
