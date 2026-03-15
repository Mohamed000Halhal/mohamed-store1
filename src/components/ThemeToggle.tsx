'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { settings, toggleDarkMode } = useTheme()
  const isDark = settings.darkMode

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleDarkMode}
      aria-label="Toggle Theme"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '56px',
        height: '30px',
        borderRadius: '99px',
        padding: '2px',
        border: '1px solid var(--border-color)',
        backgroundColor: isDark ? '#6366f1' : '#e2e8f0',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer',
        boxShadow: isDark ? '0 0 10px rgba(99,102,241,0.35)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Track icons */}
      <span style={{
        position: 'absolute',
        left: '6px',
        display: 'flex',
        alignItems: 'center',
        color: '#fbbf24',
        opacity: isDark ? 0 : 1,
        transition: 'opacity 0.25s',
      }}>
        <Sun size={12} />
      </span>
      <span style={{
        position: 'absolute',
        right: '6px',
        display: 'flex',
        alignItems: 'center',
        color: '#e2e8f0',
        opacity: isDark ? 1 : 0,
        transition: 'opacity 0.25s',
      }}>
        <Moon size={12} />
      </span>

      {/* Thumb */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          marginLeft: isDark ? 'auto' : '0',
          color: isDark ? '#6366f1' : '#f59e0b',
        }}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </motion.span>
    </motion.button>
  )
}
