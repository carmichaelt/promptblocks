"use client"

import { useEffect, useRef } from "react"

// Define LeaderLine instance type
interface LeaderLineInstance {
  position: () => void
  remove: () => void
}

// Define LeaderLine constructor type
type LeaderLineType = {
  new (
    start: HTMLElement,
    end: HTMLElement,
    options: {
      color: string
      size: number
      path: 'straight' | 'arc' | 'fluid' | 'magnet' | 'grid'
      startSocket?: string
      endSocket?: string
      startPlug?: string
      endPlug?: string
      gradient?: boolean
      dash?: { animation: boolean }
    }
  ): LeaderLineInstance
}

// Initialize LeaderLine with proper type
let LeaderLine: LeaderLineType | undefined
if (typeof window !== 'undefined') {
  LeaderLine = require('leader-line-new') as LeaderLineType
}

interface BlockConnectionProps {
  startElement: HTMLElement
  endElement: HTMLElement
  isEnabled: boolean
}

export default function BlockConnection({ startElement, endElement, isEnabled }: BlockConnectionProps) {
  const lineRef = useRef<LeaderLineInstance | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !LeaderLine) return
    if (!startElement || !endElement) return

    // Create new leader line
    lineRef.current = new LeaderLine(
      startElement,
      endElement,
      {
        color: isEnabled ? "rgba(139, 92, 246, 0.5)" : "rgba(148, 163, 184, 0.2)",
        size: 2,
        path: "straight",
        startSocket: "bottom",
        endSocket: "top",
        startPlug: "behind",
        endPlug: "behind",
        gradient: true,
        dash: { animation: isEnabled ? true : false },
      }
    )

    // Position the line behind the blocks
    const line = document.querySelector(".leader-line:last-child") as HTMLElement
    if (line) {
      line.style.zIndex = "0"
    }

    return () => {
      if (lineRef.current) {
        lineRef.current.remove()
      }
    }
  }, [startElement, endElement, isEnabled])

  // Update line position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (lineRef.current) {
        lineRef.current.position()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return null
} 