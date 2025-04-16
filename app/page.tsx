"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SimplePromptInput from "@/components/simple-prompt-input"
import type { PromptBlock } from "@/types/prompt-types"

// Assuming you have a way to get available models, e.g., from config
const availableModels = ["grok-3-mini", "grok-3-large", "gpt-4", "claude-3"]

export default function QuickPromptPage() {
  const [selectedModel, setSelectedModel] = useState(availableModels[0])
  const router = useRouter()

  const handleGenerationComplete = (data: {
    templateId: string
    blocks: PromptBlock[]
  }) => {
    // Store the data in localStorage for the builder page to pick up
    localStorage.setItem("quickPromptData", JSON.stringify(data))
    router.push("/builder")
  }

  return (
    <div className="container mx-auto px-1 md:px-4 mb-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          Quick Prompt
        </h1>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
          Generate a prompt quickly using natural language
        </p>
      </div>

      <div className="mx-auto w-full">
        <SimplePromptInput
          onGenerationComplete={handleGenerationComplete}
          availableModels={availableModels}
          selectedModel={selectedModel}
          //onModelChange={setSelectedModel}
        />
      </div>
    </div>
  )
}
