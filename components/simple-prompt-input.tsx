"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowUpIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { PromptBlock, PromptTemplate } from "@/types/prompt-types"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"

interface SimplePromptInputProps {
  onGenerationComplete: (data: { templateId: string; blocks: PromptBlock[] }) => void
  availableModels: string[] // Or fetch dynamically if needed
  selectedModel: string // Pass down selected model
}

export default function SimplePromptInput({
  onGenerationComplete,
  availableModels,
  selectedModel,
}: SimplePromptInputProps) {
  const [simplePrompt, setSimplePrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!simplePrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your goal or idea.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    toast({ title: "Generating Prompt...", description: `Using ${selectedModel} to analyze and build prompt.` })

    try {
      const response = await fetch("/api/simple-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simplePrompt: simplePrompt,
          selectedModel: selectedModel,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(`API error: ${response.statusText || response.status} - ${errorBody?.details || "Failed to generate"}`)
      }

      const result = await response.json()

      if (result.templateId && result.blocks) {
        toast({
          title: "Prompt Generated!",
          description: `Selected template: ${result.templateId}. Switching to builder view.`,
        })
        setSimplePrompt("")
        console.log("[SimplePromptInput] Calling onGenerationComplete with:", { templateId: result.templateId, blocks: result.blocks });
        onGenerationComplete({ templateId: result.templateId, blocks: result.blocks })
      } else {
        throw new Error("Invalid response structure from API.")
      }
    } catch (error) {
      console.error("Simple prompt generation failed:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate the prompt.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-center text-slate-700 dark:text-slate-300">
        Start with a Simple Goal
      </h2>
      <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-4">
        Describe what you want to achieve, or try a suggestion:
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <PromptSuggestion onClick={() => setSimplePrompt("Write a Python script to scrape website titles")}>
          Scrape website titles
        </PromptSuggestion>
        <PromptSuggestion onClick={() => setSimplePrompt("Create a marketing email for a new product launch")}>
          Draft marketing email
        </PromptSuggestion>
        <PromptSuggestion onClick={() => setSimplePrompt("Generate ideas for a fantasy novel")}>
          Ideas for fantasy novel
        </PromptSuggestion>
        <PromptSuggestion onClick={() => setSimplePrompt("Explain quantum physics simply")}>
          Explain quantum physics
        </PromptSuggestion>
      </div>

      <PromptInput
        value={simplePrompt}
        onValueChange={setSimplePrompt}
        onSubmit={handleGenerate}
        isLoading={isLoading}
        className="border-input bg-background border shadow-xs"
      >
        <PromptInputTextarea
          placeholder="e.g., Write a Python script to scrape website titles..."
        />
        <PromptInputActions className="justify-end">
          <Button
            size="sm"
            className="size-9 cursor-pointer rounded-full shimmer-button bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500"
            onClick={handleGenerate}
            disabled={isLoading || !simplePrompt.trim()}
            aria-label="Generate"
          >
            {isLoading ? (
              <Sparkles size={18} className="animate-spin" />
            ) : (
              <ArrowUpIcon className="h-4 min-h-4 min-w-4 w-4" />
            )}
          </Button>
        </PromptInputActions>
      </PromptInput>
    </div>
  )
} 