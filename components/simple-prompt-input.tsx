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
    <div className="w-full mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Start with a simple description
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Or try one of our suggestions below
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto px-4">
        <PromptSuggestion 
          className="w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                     border border-slate-200/50 dark:border-slate-700/50
                     shadow-sm hover:shadow-md dark:shadow-none
                     transition-all duration-200
                     hover:scale-[1.02] active:scale-[0.98]
                     dark:hover:bg-slate-800"
          onClick={() => setSimplePrompt("Create a NextJS app to track my exercise")}
        >
          Create a NextJS app to track my exercise
        </PromptSuggestion>
        <PromptSuggestion 
          className="w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                     border border-slate-200/50 dark:border-slate-700/50
                     shadow-sm hover:shadow-md dark:shadow-none
                     transition-all duration-200
                     hover:scale-[1.02] active:scale-[0.98]
                     dark:hover:bg-slate-800"
          onClick={() => setSimplePrompt("Create a marketing email about our new features")}
        >
          Draft a marketing email about our new features
        </PromptSuggestion>
        <PromptSuggestion 
          className="w-full sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                     border border-slate-200/50 dark:border-slate-700/50
                     shadow-sm hover:shadow-md dark:shadow-none
                     transition-all duration-200
                     hover:scale-[1.02] active:scale-[0.98]
                     dark:hover:bg-slate-800"
          onClick={() => setSimplePrompt("Generate ideas for a fantasy novel")}
        >
          Suggest ideas for a fantasy novel
        </PromptSuggestion>
      </div>

      <PromptInput
        value={simplePrompt}
        onValueChange={setSimplePrompt}
        onSubmit={handleGenerate}
        isLoading={isLoading}
        className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 shadow-sm"
      >
        <PromptInputTextarea
          placeholder="Describe what you want to achieve, or try a suggestion above"
          className="min-h-[100px] placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <PromptInputActions className="justify-end">
          <Button
            size="sm"
            className="size-9 cursor-pointer rounded-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                       text-white shadow-lg hover:shadow-xl transition-all duration-200
                       disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
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