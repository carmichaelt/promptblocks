"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TourStep {
  target: string
  title: string
  content: string
  position: "top" | "right" | "bottom" | "left"
}

interface OnboardingTourProps {
  steps: TourStep[]
  isOpen: boolean
  onClose: () => void
}

export default function OnboardingTour({ steps, isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const step = steps[currentStep]
      const targetElement = document.querySelector(step.target)

      if (!targetElement) return

      const rect = targetElement.getBoundingClientRect()
      const tooltipWidth = 300
      const tooltipHeight = 150

      let top = 0
      let left = 0

      switch (step.position) {
        case "top":
          top = rect.top - tooltipHeight - 10
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + 10
          break
        case "bottom":
          top = rect.bottom + 10
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - 10
          break
      }

      setPosition({ top, left })

      // Add highlight to the target element
      targetElement.classList.add("ring-2", "ring-purple-500", "ring-offset-2")

      return () => {
        targetElement.classList.remove("ring-2", "ring-purple-500", "ring-offset-2")
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isOpen, currentStep, steps])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute pointer-events-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 w-[300px]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <X size={16} />
          </button>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{steps[currentStep].content}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button size="sm" variant="outline" onClick={prevStep}>
                  <ChevronLeft size={14} className="mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={nextStep}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight size={14} className="ml-1" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
