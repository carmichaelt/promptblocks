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
    <div className="w-full max-w-6xl mx-auto space-y-4 p-4 bg-white/80 dark:bg-slate-800/80 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-center text-slate-700 dark:text-slate-300">
        Start with a simple description of what you want to achieve
      </h2>

      <div className="flex flex-wrap justify-center gap-2">
        <PromptSuggestion className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" onClick={() => setSimplePrompt("Write a Python script to scrape website titles")}>
          Create a NextJS app to track my exercise
        </PromptSuggestion>
        <PromptSuggestion className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" onClick={() => setSimplePrompt("Create a marketing email about our new features")}>
          Draft a marketing email about our new features
        </PromptSuggestion>
        <PromptSuggestion className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" onClick={() => setSimplePrompt("Generate ideas for a fantasy novel")}>
          Suggest ideas for a fantasy novel
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
          placeholder="Describe what you want to achieve, or try a suggestion above"
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