"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowUpIcon, Lightbulb } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { PromptBlock, PromptTemplate } from "@/types/prompt-types"
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { motion, AnimatePresence } from "framer-motion"

interface SimplePromptInputProps {
  onGenerationComplete: (data: { templateId: string; blocks: PromptBlock[] }) => void
  availableModels: string[] // Or fetch dynamically if needed
  selectedModel: string // Pass down selected model
}

const suggestions = [
  {
    text: "Create a NextJS app to track my exercise",
    gradient: "from-purple-200 to-pink-200 dark:from-purple-800/50 dark:to-pink-800/50",
  },
  {
    text: "Draft a marketing email about our new features",
    gradient: "from-pink-200 to-amber-200 dark:from-pink-800/50 dark:to-amber-800/50",
  },
  {
    text: "Suggest ideas for a fantasy novel",
    gradient: "from-amber-200 to-purple-200 dark:from-amber-800/50 dark:to-purple-800/50",
  },
  {
    text: "Design a landing page for my startup",
    gradient: "from-blue-200 to-purple-200 dark:from-blue-800/50 dark:to-purple-800/50",
  },
  {
    text: "Write a blog post about AI trends",
    gradient: "from-green-200 to-blue-200 dark:from-green-800/50 dark:to-blue-800/50",
  },
  {
    text: "Create a social media content calendar",
    gradient: "from-purple-200 to-blue-200 dark:from-purple-800/50 dark:to-blue-800/50",
  },
]

const promptingTips = [
  "Be specific: Clearly define the task or topic.",
  "Provide context: Give background information if needed.",
  "Set constraints: Specify desired length, format, or tone.",
  "Use keywords: Include relevant terms for better results.",
  "Iterate: Refine your prompt based on initial outputs.",
  "Experiment: Try different phrasing or approaches.",
  "Define the role: Ask the AI to act as an expert (e.g., 'Act as a senior copywriter').",
  "Break down complex tasks: Use multiple prompts for intricate goals.",
  "Use the right model: Choose the appropriate model for your task.",
  "Check the output: Review the generated content for accuracy and relevance.",
  "Optimize for results: Tailor your prompt to get the best possible output.",
  "Use examples: Provide specific examples or references to improve clarity.",
  "Keep it concise: Avoid unnecessary details or冗余的细节。",
  "Use clear instructions: Provide specific and clear instructions for the AI.",
  "Test and refine: Test the prompt and refine it based on feedback.",
  "Use the right model: Choose the appropriate model for your task.",
  "Check the output: Review the generated content for accuracy and relevance.",
  
];

export default function SimplePromptInput({
  onGenerationComplete,
  availableModels,
  selectedModel,
}: SimplePromptInputProps) {
  const [simplePrompt, setSimplePrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the textarea on component mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Auto-rotate suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((current) => (current + 1) % suggestions.length)
    }, 6000) // Change every 6 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-rotate tips during loading
  useEffect(() => {
    let tipInterval: NodeJS.Timeout | null = null;
    if (isLoading) {
      tipInterval = setInterval(() => {
        setCurrentTipIndex((current) => (current + 1) % promptingTips.length);
      }, 3000); // Change tip every 3 seconds
    } else {
      setCurrentTipIndex(0); // Reset to first tip when not loading
    }

    return () => {
      if (tipInterval) clearInterval(tipInterval);
    };
  }, [isLoading]);

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
      <div className="relative py-6 max-w-3xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSuggestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <PromptSuggestion 
              className={`w-full bg-gradient-to-br dark:bg-gradient-to-br ${suggestions[currentSuggestionIndex].gradient} 
                       border border-slate-200/50 dark:border-slate-500/50
                       shadow-sm hover:shadow-md dark:shadow-none
                       transition-all duration-200
                       hover:scale-[1.02] active:scale-[0.98]
                       dark:hover:bg-slate-800
                       flex items-center justify-center text-center px-6`}
              onClick={() => setSimplePrompt(suggestions[currentSuggestionIndex].text)}
            >
              {suggestions[currentSuggestionIndex].text}
            </PromptSuggestion>
          </motion.div>
        </AnimatePresence>
      </div>

      <PromptInput
        value={simplePrompt}
        onValueChange={setSimplePrompt}
        onSubmit={handleGenerate}
        isLoading={isLoading}
        className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600/50 shadow-dark-lg dark:shadow-slate-500"
      >
        <PromptInputTextarea
          ref={textareaRef}
          placeholder="Ask anything?"
          className="text-lg min-h-[100px] bg-white dark:bg-slate-900 placeholder:text-slate-700 dark:placeholder:text-slate-300 dark:text-slate-200
                    after:content-['|'] after:ml-[1px] after:animate-blink after:text-slate-700 dark:after:text-slate-300"
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

      {/* Loading Tips Section */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 max-w-3xl mx-auto overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                <Sparkles size={16} className="mr-2 animate-spin text-purple-500" />
                Generating prompt... Here's a tip:
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-slate-700 dark:text-slate-300"
                >
                   <Lightbulb size={14} className="inline-block mr-1.5 text-amber-500" />
                  {promptingTips[currentTipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 