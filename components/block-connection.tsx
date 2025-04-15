"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface BlockConnectionProps {
  startElement: HTMLElement
  endElement: HTMLElement
  isEnabled: boolean
}

export default function BlockConnection({ startElement, endElement, isEnabled }: BlockConnectionProps) {
  const connectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startElement || !endElement || !connectionRef.current) return

    const updateConnection = () => {
      const connection = connectionRef.current
      if (!connection) return

      const startRect = startElement.getBoundingClientRect()
      const endRect = endElement.getBoundingClientRect()

      // Calculate the center points
      const startX = startRect.left + startRect.width / 2
      const startY = startRect.bottom
      const endX = endRect.left + endRect.width / 2
      const endY = endRect.top

      // Calculate the line length and angle
      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI

      // Position and rotate the line
      connection.style.width = `${length}px`
      connection.style.left = `${startX}px`
      connection.style.top = `${startY}px`
      connection.style.transform = `rotate(${angle}deg)`
    }

    // Initial update
    updateConnection()

    // Update on window resize
    window.addEventListener('resize', updateConnection)
    
    // Update on scroll
    window.addEventListener('scroll', updateConnection)

    return () => {
      window.removeEventListener('resize', updateConnection)
      window.removeEventListener('scroll', updateConnection)
    }
  }, [startElement, endElement])

  return (
    <div
      ref={connectionRef}
      className={cn(
        "fixed h-[2px] origin-left pointer-events-none transition-colors duration-200",
        isEnabled 
          ? "bg-gradient-to-r from-violet-400/50 to-violet-500/50" 
          : "bg-gradient-to-r from-slate-300/20 to-slate-400/20"
      )}
      style={{ zIndex: 0 }}
    />
  )
} 