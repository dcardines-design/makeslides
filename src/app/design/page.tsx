'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Plus, X, ChevronDown, Search, Link, ImageIcon, Type } from 'lucide-react';

export default function DesignComponents() {
  const [inputValue, setInputValue] = useState('');
  const [selectedTab, setSelectedTab] = useState('unsplash');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Design Components</h1>
        <p className="text-[#666] mb-12">MakeSlides UI Component Library</p>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Buttons
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B] space-y-6">
            {/* Button Sizes - Primary */}
            <div>
              <p className="text-xs text-[#666] mb-3">Primary Button Sizes</p>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <button
                    className="px-3 py-2 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[11px] tracking-[1px] hover:bg-[#4B2DE1] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <Plus size={12} />
                    SMALL
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">px-3 py-2 text-[11px]</p>
                </div>
                <div className="text-center">
                  <button
                    className="px-[14px] py-[8px] rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] hover:bg-[#4B2DE1] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <Search size={14} />
                    MED
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">px-[14px] py-[8px] text-[12px]</p>
                </div>
                <div className="text-center">
                  <button
                    className="px-[14px] py-2.5 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] hover:bg-[#4B2DE1] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <Sparkles size={14} />
                    LARGE
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">px-[14px] py-2.5 text-[12px]</p>
                </div>
              </div>
            </div>

            {/* Button Sizes - Secondary */}
            <div>
              <p className="text-xs text-[#666] mb-3">Secondary Button Sizes</p>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <button
                    className="px-3 py-2 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white font-medium text-[11px] tracking-[1px] hover:bg-[#2B2B2B] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <Plus size={12} />
                    SMALL
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">px-3 py-2 text-[11px]</p>
                </div>
                <div className="text-center">
                  <button
                    className="px-[14px] py-[8px] rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white font-medium text-[12px] tracking-[1.44px] hover:bg-[#2B2B2B] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <Search size={14} />
                    MED
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">px-[14px] py-[8px] text-[12px]</p>
                </div>
                <div className="text-center">
                  <button
                    className="px-[14px] py-2.5 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white font-medium text-[12px] tracking-[1.44px] hover:bg-[#2B2B2B] transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <Sparkles size={14} />
                    LARGE
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">px-[14px] py-2.5 text-[12px]</p>
                </div>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <p className="text-xs text-[#666] mb-3">Icon Buttons</p>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <button className="p-2 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-[#888] hover:text-white transition-colors">
                    <Type size={14} />
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">p-2 (small)</p>
                </div>
                <div className="text-center">
                  <button className="p-3 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-[#888] hover:text-white transition-colors">
                    <ImageIcon size={18} />
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">p-3 (medium)</p>
                </div>
                <div className="text-center">
                  <button className="p-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white transition-colors">
                    <ImageIcon size={18} />
                  </button>
                  <p className="text-[10px] text-[#555] mt-2">Active</p>
                </div>
              </div>
            </div>

            {/* Loading Button */}
            <div>
              <p className="text-xs text-[#666] mb-3">Loading State</p>
              <button
                disabled
                className="px-[14px] py-2.5 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] opacity-50 flex items-center gap-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <Loader2 size={14} className="animate-spin" />
                GENERATING...
              </button>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Tabs / Chips
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B] space-y-6">
            {/* Small Tabs */}
            <div>
              <p className="text-xs text-[#666] mb-3">Small</p>
              <div className="flex gap-2">
                {['unsplash', 'pinterest', 'collection'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-3 py-2 rounded-[10px] font-medium text-[11px] tracking-[1px] border transition-all duration-150 ${
                      i === 0
                        ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                        : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
                    }`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#555] mt-2">px-3 py-2 text-[11px]</p>
            </div>

            {/* Medium Tabs */}
            <div>
              <p className="text-xs text-[#666] mb-3">Medium</p>
              <div className="flex gap-2">
                {['unsplash', 'pinterest', 'collection'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-[14px] py-[8px] rounded-[10px] font-medium text-[12px] tracking-[1.44px] border transition-all duration-150 ${
                      i === 0
                        ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                        : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
                    }`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#555] mt-2">px-[14px] py-[8px] text-[12px]</p>
            </div>

            {/* Large Tabs */}
            <div>
              <p className="text-xs text-[#666] mb-3">Large</p>
              <div className="flex gap-2">
                {['unsplash', 'pinterest', 'collection'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-[14px] py-2.5 rounded-[10px] font-medium text-[12px] tracking-[1.44px] border transition-all duration-150 ${
                      i === 0
                        ? 'bg-[#2A1E66] border-[#3B1DD1] text-white'
                        : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
                    }`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#555] mt-2">px-[14px] py-2.5 text-[12px]</p>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Inputs
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B] space-y-6">
            {/* Standalone Input Sizes */}
            <div>
              <p className="text-xs text-[#666] mb-3">Standalone Input Sizes</p>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Small input..."
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-[12px] text-white placeholder-[#7D7D7D] focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
                  />
                  <p className="text-[10px] text-[#555] mt-1">px-3 py-2 text-[12px]</p>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Medium input..."
                    className="w-full px-[14px] py-[8px] bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-[14px] text-white placeholder-[#7D7D7D] focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
                  />
                  <p className="text-[10px] text-[#555] mt-1">px-[14px] py-[8px] text-[14px]</p>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Large input..."
                    className="w-full px-[14px] py-2.5 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-[14px] text-white placeholder-[#7D7D7D] focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
                  />
                  <p className="text-[10px] text-[#555] mt-1">px-[14px] py-2.5 text-[14px]</p>
                </div>
              </div>
            </div>

            {/* Input with Button (side by side) */}
            <div>
              <p className="text-xs text-[#666] mb-3">Input with Button</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search tags..."
                  className="flex-1 px-[14px] py-[8px] bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-[14px] text-white placeholder-[#7D7D7D] focus:outline-none hover:border-[#3B1DD1]/50 focus:border-[#3B1CD1] transition-all duration-150"
                />
                <button
                  className="px-[14px] py-[8px] rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white text-[12px] font-medium tracking-[1.44px] hover:bg-[#4B2DE1] transition-all duration-150"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  SEARCH
                </button>
              </div>
            </div>

            {/* Dashed Input */}
            <div>
              <label
                className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
              >
                Dashed Input (Add URL)
              </label>
              <div className="relative">
                <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D7D7D]" />
                <input
                  type="text"
                  placeholder="Paste Pinterest/Image URL"
                  className="w-full pl-11 pr-4 py-3 bg-transparent border border-dashed border-[#2B2B2B] rounded-[10px] text-sm text-white placeholder-[#7D7D7D] focus:outline-none focus:border-[#3B1CD1] transition-colors"
                />
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label
                className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
              >
                Textarea
              </label>
              <textarea
                placeholder="gimme 7 slides, each slide gives budgeting tips"
                className="w-full h-24 px-5 py-4 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-white text-sm placeholder-[#7D7D7D] resize-none focus:outline-none focus:border-[#3B1CD1]"
              />
            </div>

            {/* Dropdown */}
            <div>
              <label
                className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
                style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
              >
                Dropdown
              </label>
              <div className="relative inline-block">
                <select className="px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B1CD1] pr-10">
                  <option>36px</option>
                  <option>48px</option>
                  <option>64px</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Cards
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B] space-y-4">
            {/* Basic Card */}
            <div className="p-3 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px]">
              <p className="text-white text-sm">Basic Card</p>
              <p className="text-[#666] text-xs mt-1">Card content goes here</p>
            </div>

            {/* History Item */}
            <div className="p-3.5 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#3B1CD1] transition-colors">
              <p className="text-white text-sm line-clamp-2">gimme 7 slides, each slide gives budgeting tips</p>
              <div className="flex items-center gap-2 mt-1.5 text-[#666] text-xs">
                <span>7 slides</span>
                <span>•</span>
                <span>2h ago</span>
              </div>
            </div>
          </div>
        </section>

        {/* Image Grid Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Image Grid
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B]">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  className={`aspect-square rounded-[8px] overflow-hidden border-2 transition-colors ${
                    i === 2 ? 'border-[#3B1DD1]' : 'border-transparent hover:border-[#3B1DD1]/50'
                  } bg-[#2B2B2B]`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Colors
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B]">
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Background', color: '#0a0a0a' },
                { name: 'Panel', color: '#151515' },
                { name: 'Surface', color: '#1F1F1F' },
                { name: 'Border', color: '#2B2B2B' },
                { name: 'Primary', color: '#3B1FD1' },
                { name: 'Primary Hover', color: '#4B2DE1' },
                { name: 'Primary Border', color: '#6345FA' },
                { name: 'Muted Text', color: '#8A8A8A' },
                { name: 'Disabled Text', color: '#666666' },
                { name: 'Placeholder', color: '#7D7D7D' },
                { name: 'Helper Text', color: '#555555' },
                { name: 'White', color: '#ffffff' },
              ].map((c) => (
                <div key={c.name} className="text-center">
                  <div
                    className="w-full aspect-square rounded-[10px] border border-[#2B2B2B] mb-2"
                    style={{ backgroundColor: c.color }}
                  />
                  <p className="text-xs text-white">{c.name}</p>
                  <p className="text-[10px] text-[#666]">{c.color}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Typography
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B] space-y-6">
            {/* Fonts */}
            <div>
              <p className="text-xs text-[#666] mb-3">Font Families</p>
              <div className="space-y-3">
                <div>
                  <p className="text-lg text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Space Grotesk - Labels & Buttons
                  </p>
                  <p className="text-[10px] text-[#666]">font-family: 'Space Grotesk', sans-serif</p>
                </div>
                <div>
                  <p className="text-lg text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Space Grotesk - Body Text
                  </p>
                  <p className="text-[10px] text-[#666]">font-family: 'Space Grotesk', sans-serif</p>
                </div>
              </div>
            </div>

            {/* Text Styles */}
            <div>
              <p className="text-xs text-[#666] mb-3">Text Styles</p>
              <div className="space-y-4">
                <div>
                  <p
                    className="text-[10px] text-[#8A8A8A] uppercase font-medium"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
                  >
                    Section Label
                  </p>
                  <p className="text-[10px] text-[#555] mt-1">text-[10px] uppercase font-medium tracking-[1.2px] text-[#8A8A8A]</p>
                </div>
                <div>
                  <p
                    className="text-[12px] text-white font-medium tracking-[1.44px]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    BUTTON TEXT
                  </p>
                  <p className="text-[10px] text-[#555] mt-1">text-[12px] font-medium tracking-[1.44px]</p>
                </div>
                <div>
                  <p className="text-sm text-white">Body Text</p>
                  <p className="text-[10px] text-[#555] mt-1">text-sm (14px)</p>
                </div>
                <div>
                  <p className="text-xs text-[#666]">Helper / Meta Text</p>
                  <p className="text-[10px] text-[#555] mt-1">text-xs (12px) text-[#666]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Spacing
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B]">
            <div className="space-y-4">
              {[
                { name: 'gap-2', value: '8px', desc: 'Between buttons, grid items' },
                { name: 'mb-2', value: '8px', desc: 'Label to input' },
                { name: 'mb-4 / gap-4', value: '16px', desc: 'Between sections (small)' },
                { name: 'mb-6', value: '24px', desc: 'Between sections (large)' },
                { name: 'p-3', value: '12px', desc: 'Card padding (small)' },
                { name: 'px-6 py-6', value: '24px', desc: 'Modal padding' },
                { name: 'px-[14px] py-[8px]', value: '14px / 8px', desc: 'Button padding (small)' },
                { name: 'px-[14px] py-3', value: '14px / 12px', desc: 'Button padding (medium)' },
                { name: 'px-[18px] py-[10px]', value: '18px / 10px', desc: 'Grouped input padding' },
                { name: 'px-5 py-3', value: '20px / 12px', desc: 'Standalone input padding' },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <code className="text-xs text-[#3B1FD1] bg-[#1F1F1F] px-2 py-1 rounded w-40">{s.name}</code>
                  <span className="text-xs text-white w-24">{s.value}</span>
                  <span className="text-xs text-[#666]">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Border Radius Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Border Radius
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B]">
            <div className="flex gap-6">
              {[
                { name: 'rounded-[8px]', value: '8px', desc: 'Image grid items' },
                { name: 'rounded-[10px]', value: '10px', desc: 'Buttons, inputs, cards' },
                { name: 'rounded-[20px]', value: '20px', desc: 'Modals, large panels' },
                { name: 'rounded-full', value: '9999px', desc: 'Circular buttons' },
              ].map((r) => (
                <div key={r.name} className="text-center">
                  <div
                    className="w-16 h-16 bg-[#3B1FD1] mb-2"
                    style={{ borderRadius: r.value }}
                  />
                  <p className="text-xs text-white">{r.value}</p>
                  <p className="text-[10px] text-[#666]">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Icon Sizes Section */}
        <section className="mb-12">
          <h2
            className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}
          >
            Icon Sizes
          </h2>
          <div className="p-6 bg-[#151515] rounded-[20px] border border-[#2B2B2B]">
            <div className="flex items-end gap-8">
              {[
                { size: 12, name: 'size={12}', desc: 'SMALL' },
                { size: 14, name: 'size={14}', desc: 'Default' },
                { size: 16, name: 'size={16}', desc: 'MEDium' },
                { size: 18, name: 'size={18}', desc: 'LARGE' },
                { size: 24, name: 'size={24}', desc: 'XL' },
              ].map((i) => (
                <div key={i.size} className="text-center">
                  <Sparkles size={i.size} className="text-white mx-auto mb-2" />
                  <p className="text-xs text-white">{i.size}px</p>
                  <p className="text-[10px] text-[#666]">{i.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
