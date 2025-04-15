"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

interface ParticleEffectProps {
  x: number
  y: number
}

export default function ParticleEffect({ x, y }: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationFrameId = useRef<number>(0)

  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2
    const velocity = Math.random() * 2 + 1
    const colors = ["#4338ca", "#7e22ce", "#be185d", "#0369a1"]
    
    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1,
      size: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create initial particles
    for (let i = 0; i < 30; i++) {
      particles.current.push(createParticle(x, y))
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.current = particles.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.02

        if (particle.life <= 0) return false

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.life * 255).toString(16).padStart(2, "0")}`
        ctx.fill()

        return true
      })

      if (particles.current.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [x, y])

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none"
      style={{
        width: "200px",
        height: "200px",
        left: x - 100,
        top: y - 100,
      }}
      width={200}
      height={200}
    />
  )
} 