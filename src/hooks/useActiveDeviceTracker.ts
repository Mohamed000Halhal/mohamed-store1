'use client'

import { useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Hook to track the user's current device session
export function useActiveDeviceTracker(userId: string | null, role: 'admin' | 'secretary') {
  useEffect(() => {
    if (!userId) return

    // Create or retrieve a unique device ID for this browser
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = generateDeviceId()
      localStorage.setItem('device_id', deviceId)
    }

    const deviceRef = doc(db, 'active_devices', deviceId)

    const updatePresence = async (isOnline: boolean) => {
      try {
        await setDoc(deviceRef, {
          userId,
          role,
          deviceId,
          isOnline,
          lastSeen: Date.now(),
          userAgent: window.navigator.userAgent || 'unknown'
        }, { merge: true })
      } catch (error) {
        console.warn('Presence update failed:', error)
      }
    }

    // Initial presence update
    updatePresence(document.visibilityState === 'visible')

    // Handle visibility changes (switching tabs, minimizing)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(true)
      } else {
        updatePresence(false)
      }
    }

    // Handle page closing/leaving
    const handlePageHide = () => {
      updatePresence(false)
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    // Fallback for older browsers
    window.addEventListener('beforeunload', handlePageHide)

    // Heartbeat every 1 minute if visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updatePresence(true)
      }
    }, 60000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handlePageHide)
      // Attempt to mark offline when component unmounts (e.g., logging out)
      updatePresence(false)
    }
  }, [userId, role])
}
