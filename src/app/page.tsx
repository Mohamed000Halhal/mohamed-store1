'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootStorefront() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-black tracking-widest uppercase text-xs">
        جاري التحويل...
      </div>
    </div>
  )
}
