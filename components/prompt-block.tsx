"use client"

import { forwardRef, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Info, Mic, MicOff } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { PromptBlock } from "@/types/prompt-types"
import AIPromptDialog from "./ai-prompt-dialog"
import LoadingSparkles from "./loading-sparkles"
import ParticleEffect from "./particle-effect"
import { experimental_useObject as useObject } from 'ai/react'
import { blockContentSchema } from '@/app/api/block-content/schema'

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
}

const PromptBlockComponent = forwardRef<HTMLTextAreaElement, PromptBlockProps>(
  ({ block, index, isFocused, isDisabled, onChange, onFocus, onToggle, isRecording, onRecordingToggle }, ref) => {
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
    const [particlePosition, setParticlePosition] = useState<{ x: number; y: number } | null>(null)
    const blockRef = useRef<HTMLDivElement>(null)

    const { object, isLoading: isGenerating, submit, error } = useObject({
      api: '/api/block-content',
      schema: blockContentSchema,
      onFinish: ({ object }) => {
        if (object) {
          onChange(object.content)
        }
      },
      onError: (error) => {
        console.error("Error generating content:", error)
      }
    })

    const blockColors = {
      context: "border-blue-300 bg-blue-50/90 dark:border-blue-700 dark:bg-blue-950/80",
      role: "border-purple-300 bg-purple-50/90 dark:border-purple-700 dark:bg-purple-950/80",
      task: "border-green-300 bg-green-50/90 dark:border-green-700 dark:bg-green-950/80",
      examples: "border-amber-300 bg-amber-50/90 dark:border-amber-700 dark:bg-amber-950/80",
      constraints: "border-red-300 bg-red-50/90 dark:border-red-700 dark:bg-red-950/80",
      output: "border-teal-300 bg-teal-50/90 dark:border-teal-700 dark:bg-teal-950/80",
      persona: "border-indigo-300 bg-indigo-50/90 dark:border-indigo-700 dark:bg-indigo-950/80",
      format: "border-pink-300 bg-pink-50/90 dark:border-pink-700 dark:bg-pink-950/80",
    }

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
          existingContent: block.content
        })
        setTimeout(() => setParticlePosition(null), 1000)
      }
    }

    return (
      <motion.div
        ref={blockRef}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "rounded-lg border-l-4 p-4 transition-all relative shadow-md",
          blockColors[block.type as keyof typeof blockColors],
          isFocused && "ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-600",
        )}
      >
        <AnimatePresence>
          {particlePosition && <ParticleEffect x={particlePosition.x} y={particlePosition.y} />}
        </AnimatePresence>

        <div className="mb-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {index + 1}. {block.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">(Alt+{index + 1})</span>
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
                  <span className="flex items-center text-xs px-2 py-1 rounded-full bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300">
                    {block.type}
                    <Info size={14} className="ml-1" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{block.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
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
            </TooltipProvider>

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

        <Textarea
          ref={ref}
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          disabled={isDisabled || isGenerating}
          placeholder={block.placeholder}
          className={cn(
            "min-h-24 resize-y border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90",
            isDisabled && "cursor-not-allowed",
            isGenerating && "opacity-50",
          )}
        />
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-md">
            <LoadingSparkles />
          </div>
        )}

        <AIPromptDialog
          open={isAIDialogOpen}
          onOpenChange={setIsAIDialogOpen}
          onGenerate={(content) => onChange(content)}
          blockType={block.type}
          blockLabel={block.label}
        />
      </motion.div>
    )
  },
)

PromptBlockComponent.displayName = "PromptBlockComponent"

export default PromptBlockComponent
