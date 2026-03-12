'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { settings, toggleDarkMode } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
      aria-label="Toggle Theme"
    >
      {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  )
}
