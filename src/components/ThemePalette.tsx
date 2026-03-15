'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Check, Palette } from 'lucide-react'

// Professional 10-color palette using Tailwind-like specific hex values
const colors = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Slate',  hex: '#64748b' },
  { name: 'Emerald',hex: '#10b981' },
  { name: 'Rose',   hex: '#f43f5e' },
  { name: 'Amber',  hex: '#f59e0b' },
  { name: 'Sky',    hex: '#0ea5e9' },
  { name: 'Teal',   hex: '#14b8a6' },
  { name: 'Zinc',   hex: '#71717a' },
  { name: 'Neutral',hex: '#737373' },
]

export default function ThemePalette() {
  const [activeColor, setActiveColor] = useState('#6366f1') // default Indigo
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load saved color on mount
    const saved = localStorage.getItem('themeColor')
    if (saved) {
      setActiveColor(saved)
      document.documentElement.style.setProperty('--primary-color', saved)
    }

    // click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleColorChange = (hex: string) => {
    setActiveColor(hex)
    localStorage.setItem('themeColor', hex)
    // Update the CSS variable dynamically
    document.documentElement.style.setProperty('--primary-color', hex)
  }

  return (
    <div className="relative w-full" ref={popupRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-color)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
      >
        <Palette size={20} className="shrink-0" />
        <span>تخصيص الواجهة</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-[240px] p-4 bg-white/95 dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md z-50 animate-fade-in origin-bottom">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-center">
            ألوان الثيم
          </h3>
          <div className="grid grid-cols-5 gap-2 justify-center">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => handleColorChange(c.hex)}
                title={c.name}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                  ${activeColor === c.hex ? 'border-primary outline outline-2 outline-offset-2 outline-primary scale-110 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:scale-110 cursor-pointer'}`}
                style={{ backgroundColor: c.hex }}
              >
                {activeColor === c.hex && (
                  <Check size={14} className="text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
