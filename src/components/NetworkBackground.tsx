'use client'

import React, { useEffect, useRef } from 'react'

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resize = () => {
      // Get the parent element's dimensions to fill the header area
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      } else {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      initParticles()
    }

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.vx = (Math.random() - 0.5) * 2.5 // Increased Speed
        this.vy = (Math.random() - 0.5) * 2.5 // Increased Speed
        this.radius = Math.random() * 2.5 + 1
      }

      update() {
        if (!canvas) return
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        // using primary color variable via computed style
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6366f1'
        const isDark = document.documentElement.classList.contains('dark')
        ctx.fillStyle = isDark ? primaryColor + '80' : primaryColor + '60' // 80 and 60 are hex opacities (~50%, ~38%)
        ctx.fill()
      }
    }

    const initParticles = () => {
      particles = []
      // Increased density for more interaction (smaller divisor means more particles)
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 8000) 
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6366f1'
      // Convert hex to rgb for rgba usage if it's a hex
      let rgb = '99, 102, 241'
      if (primaryColor.startsWith('#') && primaryColor.length >= 7) {
        const r = parseInt(primaryColor.slice(1, 3), 16)
        const g = parseInt(primaryColor.slice(3, 5), 16)
        const b = parseInt(primaryColor.slice(5, 7), 16)
        rgb = `${r}, ${g}, ${b}`
      }
      
      const lineColor = `rgba(${rgb}, `

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()

        // Draw connections
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `${lineColor}${1 - distance / 120})`
            ctx.lineWidth = 1
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    resize()
    animate()

    // Add mutation observer to detect theme changes and redraw context
    const observer = new MutationObserver(() => {
        // Just let the next frame pick up the new isDark status
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  )
}
