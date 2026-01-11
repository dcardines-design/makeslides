# MakeSlides - Project Guidelines

## Design System

### Colors
- Background: `#0a0a0a` (main), `#141414` (panels), `#151515` (sections)
- Surface: `#1F1F1F` (cards, inputs, buttons)
- Border: `#2B2B2B`
- Primary: `#3B1FD1` (purple), hover: `#4B2DE1`
- Primary border: `#6345FA`
- Text: `#ffffff` (primary), `#8A8A8A` (muted), `#666` (disabled)
- Placeholder: `#7D7D7D`

### Typography
- Font: `Space Grotesk` for labels/buttons, `Inter` for body
- Section labels: `text-[10px] uppercase font-medium tracking-[1.2px]` color `#8A8A8A`
- Button text: `text-[12px] font-medium tracking-[1.44px]`

### Components

#### Primary Button (Purple)
```tsx
<button className="px-[14px] py-3 rounded-[10px] bg-[#3B1FD1] border border-[#6345FA] text-white font-medium text-[12px] tracking-[1.44px] hover:bg-[#4B2DE1] transition-colors disabled:opacity-50"
  style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
  BUTTON TEXT
</button>
```

#### Secondary Button (Dark)
```tsx
<button className="px-[14px] py-[8px] rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-white font-medium text-sm hover:bg-[#2B2B2B] transition-colors">
  SEARCH
</button>
```

#### Icon Button
```tsx
<button className="p-3 rounded-[10px] bg-[#1F1F1F] border border-[#2B2B2B] text-[#888] hover:text-white transition-colors">
  <Icon size={18} />
</button>
```

#### Tab/Chip Button
```tsx
<button className={`px-[14px] py-[8px] rounded-[10px] text-sm font-medium transition-colors border ${
  active
    ? 'bg-[#3B1CD1] border-[#3B1CD1] text-white'
    : 'bg-[#1F1F1F] border-[#2B2B2B] text-[#888] hover:text-white'
}`}>
  Tab Name
</button>
```

#### Text Input
```tsx
<input className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-sm text-white placeholder-[#7D7D7D] focus:outline-none focus:border-[#3B1CD1]" />
```

#### Textarea
```tsx
<textarea className="w-full h-24 px-5 py-4 bg-[#0a0a0a] border border-[#2B2B2B] rounded-[10px] text-white text-sm placeholder-[#7D7D7D] resize-none focus:outline-none focus:border-[#3B1CD1]" />
```

#### Dropdown
```tsx
<select className="w-full px-[14px] py-[8px] bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#3B1CD1]">
```

#### Section Header
```tsx
<label className="text-[10px] text-[#8A8A8A] uppercase font-medium mb-2 block"
  style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.2px' }}>
  Section Name
</label>
```

#### Modal Structure
```tsx
<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
  <div className="bg-[#1F1F1F] rounded-[20px] w-[480px] border border-[#2B2B2B]">
    {/* Header */}
    <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#2B2B2B]">
      <h2 className="text-[12px] text-[#8A8A8A] uppercase font-medium"
        style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '1.44px' }}>
        Modal Title
      </h2>
      <button className="text-[#666] hover:text-white"><X size={16} /></button>
    </div>

    {/* Content */}
    <div className="px-6 py-6 bg-[#0A0A0A]">
      {/* ... */}
    </div>

    {/* Footer */}
    <div className="px-6 py-6 bg-[#151515] rounded-b-[20px]">
      <button>SAVE</button>
    </div>
  </div>
</div>
```

#### Card/Panel
```tsx
<div className="p-3 bg-[#1F1F1F] border border-[#2B2B2B] rounded-[10px]">
```

#### Image Grid Item
```tsx
<button className={`aspect-square rounded-[8px] overflow-hidden border-2 transition-colors ${
  selected ? 'border-[#3B1DD1]' : 'border-transparent hover:border-[#3B1DD1]/50'
}`}>
  <img className="w-full h-full object-cover" />
</button>
```

### Icon Sizes
- Small: `size={12}`
- Default: `size={14}` or `size={16}`
- Medium: `size={18}`
- Large: `size={24}`

### Spacing
- Modal padding: `px-6 py-6`
- Button padding: `px-[14px] py-[8px]` (small) or `py-3` (medium)
- Gap between items: `gap-2` or `gap-[10px]`
- Section margin: `mb-6`

### Border Radius
- Small: `rounded-[8px]`
- Default: `rounded-[10px]`
- Large: `rounded-[20px]` (modals)
- Full: `rounded-full`

## File Structure
- `/src/app/api/` - API routes
- `/src/components/Editor/` - Editor components (Canvas, Modals)
- `/src/components/Sidebar/` - Sidebar components
- `/src/components/TikTok/` - TikTok integration
- `/src/stores/` - Zustand stores
- `/src/lib/` - Utilities and constants

## Key Libraries
- Next.js 16 with App Router
- Zustand for state management
- Lucide React for icons
- Tailwind CSS for styling
- Fabric.js for canvas editing
