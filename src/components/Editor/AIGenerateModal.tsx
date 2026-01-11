'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sparkles, X, Loader2, Wand2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

interface AIGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIGenerateModal({ open, onOpenChange }: AIGenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { generateSlidesFromAI } = useEditorStore();

  const examplePrompts = [
    'Give me 7 slides with budgeting tips for beginners',
    '5 slides about productivity hacks',
    '6 slides on how to save money',
    '4 slides with morning routine tips',
    '8 slides about fitness for beginners',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();

      if (data.slides && data.slides.length > 0) {
        generateSlidesFromAI(data.slides);
        onOpenChange(false);
        setPrompt('');
      } else {
        throw new Error('No slides generated');
      }
    } catch (err) {
      setError('Failed to generate slides. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-white">
                  AI Slide Generator
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[#737373]">
                  Describe what slides you want to create
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-lg hover:bg-[#262626] text-[#737373] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Give me 7 slides with budgeting tips for beginners"
                className="w-full h-28 px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-xl text-white placeholder-[#525252] resize-none focus:outline-none focus:border-[#3B1DD1] transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleGenerate();
                  }
                }}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <div>
              <p className="text-xs text-[#525252] mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1.5 text-xs bg-[#1a1a1a] text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors"
                  >
                    {example.length > 35 ? example.slice(0, 35) + '...' : example}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating slides...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate Slides
                </>
              )}
            </button>

            <p className="text-xs text-center text-[#525252]">
              Press <kbd className="px-1.5 py-0.5 bg-[#262626] rounded text-[#737373]">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-[#262626] rounded text-[#737373]">Enter</kbd> to generate
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
