"use client"

import { forwardRef, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Info, Mic, MicOff, Lightbulb } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import type { PromptBlock } from "@/types/prompt-types"
import { blockConfigs } from "@/lib/prompt-config"
import AIPromptDialog from "./ai-prompt-dialog"
import BlockInfoDialog from "./block-info-dialog"
import LoadingSparkles from "./loading-sparkles"
import ParticleEffect from "./particle-effect"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { blockContentSchema } from "@/app/api/schema"

interface PromptBlockProps {
  block: PromptBlock
  index: number
  isFocused: boolean
  isDisabled: boolean
  onChange: (content: string) => void
  onFocus: () => void
  onToggle: () => void
  isRecording: boolean
  onRecordingToggle: () => void
  selectedModel: string
  isAwaitingGeneration: boolean
}

const PromptBlockComponent = forwardRef<HTMLTextAreaElement, PromptBlockProps>(
  (
    {
      block,
      index,
      isFocused,
      isDisabled,
      onChange,
      onFocus,
      onToggle,
      isRecording,
      onRecordingToggle,
      selectedModel,
      isAwaitingGeneration,
    },
    ref,
  ) => {
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)
    const [particlePosition, setParticlePosition] = useState<{ x: number; y: number } | null>(null)
    const [showSuggestion, setShowSuggestion] = useState(false)
    const isOptional = block.label.includes("(Optional)")
    const blockRef = useRef<HTMLDivElement>(null)

    const {
      object,
      isLoading: isGenerating,
      submit,
      error,
    } = useObject({
      api: "/api/block-content",
      schema: blockContentSchema,
      onFinish: ({ object }) => {
        if (object) {
          onChange(object.content)

          // Show suggestions if available
          if (object.metadata?.suggestions?.length > 0) {
            setShowSuggestion(true)
          }
        }
      },
      onError: (error) => {
        console.error("Error generating content:", error)
      },
    })

    const blockColors = {
      context: "border-blue-300 bg-blue-50/90 dark:border-blue-700 dark:bg-blue-900/95",
      role: "border-purple-300 bg-purple-50/90 dark:border-purple-700 dark:bg-purple-900/95",
      task: "border-green-300 bg-green-50/90 dark:border-green-700 dark:bg-green-900/95",
      examples: "border-amber-300 bg-amber-50/90 dark:border-amber-700 dark:bg-amber-900/95",
      constraints: "border-red-300 bg-red-50/90 dark:border-red-700 dark:bg-red-900/95",
      output: "border-teal-300 bg-teal-50/90 dark:border-teal-700 dark:bg-teal-900/95",
      persona: "border-indigo-300 bg-indigo-50/90 dark:border-indigo-700 dark:bg-indigo-900/95",
      format: "border-pink-300 bg-pink-50/90 dark:border-pink-700 dark:bg-pink-900/95",
      audience: "border-orange-300 bg-orange-50/90 dark:border-orange-700 dark:bg-orange-900/95",
      tone: "border-cyan-300 bg-cyan-50/90 dark:border-cyan-700 dark:bg-cyan-900/95",
    }

    const showLoadingOverlay = isGenerating || isAwaitingGeneration

    const blockConfig = blockConfigs[block.type]

    const handleAIClick = async () => {
      if (!blockRef.current) return

      const rect = blockRef.current.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      setParticlePosition({ x, y })

      if (!block.content.trim()) {
        setIsAIDialogOpen(true)
      } else {
        submit({
          blockType: block.type,
          blockLabel: block.label,
          userPrompt: "Improve this content",
          existingContent: block.content,
          selectedModel,
        })
        setTimeout(() => setParticlePosition(null), 1000)
      }
    }

    const suggestions = object?.metadata?.suggestions || []

    return (
      <motion.div
        ref={blockRef}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "rounded-lg border-l-4 p-4 transition-all shadow-md",
          blockColors[block.type as keyof typeof blockColors],
          isFocused && "ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-600",
          !block.enabled && "opacity-60",
          isOptional && !block.enabled && "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700",
        )}
      >
        <AnimatePresence>
          {particlePosition && <ParticleEffect x={particlePosition.x} y={particlePosition.y} />}
        </AnimatePresence>

        <div className="mb-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {block.label}
            </span>
            {/* <span className="text-xs text-slate-500 dark:text-slate-400">(Alt+{index + 1})</span> */}
            <div className="ml-2">
              <Switch
                checked={block.enabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-slate-300 data-[state=checked]:dark:bg-slate-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsInfoDialogOpen(true)}
                  >
                    <Info size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View block information and examples</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/*<TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-7 w-7", isRecording && "text-red-500 dark:text-red-400 animate-pulse")}
                    onClick={onRecordingToggle}
                    disabled={isDisabled}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? "Stop voice input" : "Start voice input"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>*/}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-7 w-7", isGenerating && "animate-pulse text-amber-500 dark:text-amber-400")}
                    onClick={handleAIClick}
                    disabled={isGenerating || isDisabled}
                  >
                    <Sparkles size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{block.content ? "Enhance with AI" : "Generate with AI"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="relative">
          <motion.div
            initial={false}
            animate={{ opacity: isDisabled ? 0.6 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              ref={ref}
              value={block.content}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              disabled={isDisabled || isGenerating || !block.enabled}
              placeholder={block.placeholder}
              className={cn(
                "min-h-24 resize-y border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90",
                isDisabled && "cursor-not-allowed",
                isGenerating && "opacity-50",
                !block.enabled && "cursor-not-allowed bg-slate-50 dark:bg-slate-800",
                isOptional && !block.enabled && "bg-slate-100 dark:bg-slate-800"
              )}
            />
          </motion.div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {(isGenerating || isAwaitingGeneration) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 rounded-lg backdrop-blur-sm"
              >
                <LoadingSpinner 
                  variant={isGenerating ? "default" : "secondary"}
                  size="lg"
                  label={isGenerating ? "Generating content..." : "Waiting to generate..."}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestion && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md"
            >
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Suggestion:</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">{suggestions[0]}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowSuggestion(false)}>
                  Dismiss
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialogs */}
        <AIPromptDialog
          open={isAIDialogOpen}
          onOpenChange={setIsAIDialogOpen}
          onGenerate={(content) => onChange(content)}
          blockType={block.type}
          blockLabel={block.label}
          selectedModel={selectedModel}
        />

        <BlockInfoDialog
          open={isInfoDialogOpen}
          onOpenChange={setIsInfoDialogOpen}
          blockConfig={blockConfig}
        />
      </motion.div>
    )
  },
)

PromptBlockComponent.displayName = "PromptBlockComponent"

export default PromptBlockComponent
