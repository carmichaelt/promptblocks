"use client"

import { useState, useEffect } from "react"
import PromptBuilder from "@/components/prompt-builder"
import type { PromptBlock } from "@/types/prompt-types"

// Assuming you have a way to get available models, e.g., from config
const availableModels = ["grok-3-mini", "grok-3-large", "gpt-4", "claude-3"]

export default function BuilderPage() {
  const [selectedModel, setSelectedModel] = useState(availableModels[0])
  const [initialData, setInitialData] = useState<{
    templateId: string
    blocks: PromptBlock[]
  } | null>(null)

  // Check for data from quick prompt on mount
  useEffect(() => {
    const quickPromptData = localStorage.getItem("quickPromptData")
    if (quickPromptData) {
      try {
        const data = JSON.parse(quickPromptData)
        setInitialData(data)
        // Clear the data so it's not loaded again
        localStorage.removeItem("quickPromptData")
      } catch (e) {
        console.error("Failed to parse quick prompt data", e)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-0 md:px-4 max-w-[850px]">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          Block Builder
        </h1>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
          Build powerful AI prompts using specialized blocks
        </p>
      </div>

      <PromptBuilder
        key={initialData ? `builder-${initialData.templateId}` : 'builder-default'}
        initialTemplateId={initialData?.templateId}
        initialBlocks={initialData?.blocks}
        selectedModelFromParent={selectedModel}
        onModelChangeFromParent={setSelectedModel}
      />
    </div>
  )
} 