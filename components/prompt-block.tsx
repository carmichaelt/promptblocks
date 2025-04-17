"use client"

import { forwardRef, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Info, Mic, MicOff, Lightbulb } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
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
      context: "border-blue-300 bg-blue-50/90 dark:border-blue-700 dark:bg-blue-900/95 text-blue-600 dark:text-blue-300",
      role: "border-purple-300 bg-purple-50/90 dark:border-purple-700 dark:bg-purple-900/95 text-purple-600 dark:text-purple-300",
      task: "border-green-300 bg-green-50/90 dark:border-green-700 dark:bg-green-900/95 text-green-600 dark:text-green-300",
      examples: "border-amber-300 bg-amber-50/90 dark:border-amber-700 dark:bg-amber-900/95 text-amber-600 dark:text-amber-300",
      constraints: "border-red-300 bg-red-50/90 dark:border-red-700 dark:bg-red-900/95 text-red-600 dark:text-red-300",
      output: "border-teal-300 bg-teal-50/90 dark:border-teal-700 dark:bg-teal-900/95 text-teal-600 dark:text-teal-300",
      persona: "border-indigo-300 bg-indigo-50/90 dark:border-indigo-700 dark:bg-indigo-900/95 text-indigo-600 dark:text-indigo-300",
      format: "border-pink-300 bg-pink-50/90 dark:border-pink-700 dark:bg-pink-900/95 text-pink-600 dark:text-pink-300",
      audience: "border-orange-300 bg-orange-50/90 dark:border-orange-700 dark:bg-orange-900/95 text-orange-600 dark:text-orange-300",
      tone: "border-cyan-300 bg-cyan-50/90 dark:border-cyan-700 dark:bg-cyan-900/95 text-cyan-600 dark:text-cyan-300",
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
        className="w-full flex justify-center"
      >
        <Card
          className={cn(
            "border-l-4 transition-all w-full max-w-[35em]",
            block.enabled ? blockColors[block.type as keyof typeof blockColors] : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/50",
            isFocused && "ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-600",
            !block.enabled && "opacity-80",
          )}
        >
          <CardHeader className="pb-2 space-y-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  block.enabled 
                    ? "text-inherit" 
                    : "text-slate-500 dark:text-slate-400"
                )}>
                  {block.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="ml-2 pt-1">
                  <Switch
                    checked={block.enabled}
                    onCheckedChange={onToggle}
                    className={cn(
                      "data-[state=checked]:bg-current data-[state=checked]:opacity-50 dark:data-[state=checked]:opacity-50 dark:data-[state=checked]:bg-current",
                      block.enabled 
                        ? "text-inherit" 
                        : "text-slate-400 dark:text-slate-600"
                    )}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          block.enabled 
                            ? "text-inherit" 
                            : "text-slate-400 dark:text-slate-600"
                        )}
                        onClick={() => setIsInfoDialogOpen(true)}
                      >
                        <Info size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View block information and examples</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          block.enabled 
                            ? cn(
                                "text-inherit",
                                isGenerating && "animate-pulse text-amber-500 dark:text-amber-400"
                              )
                            : "text-slate-400 dark:text-slate-600"
                        )}
                        onClick={handleAIClick}
                        disabled={isGenerating || !block.enabled}
                      >
                        <Sparkles size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{block.content ? "Enhance with AI" : "Generate with AI"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          <CardContent>
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
                    "min-h-24 resize-y max-w-[35em] w-full mx-0",
                    block.enabled 
                      ? "border-current border-opacity-20 bg-white/90 dark:bg-slate-900/90" 
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800",
                    isDisabled && "cursor-not-allowed",
                    isGenerating && "opacity-50"
                  )}
                />
              </motion.div>

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
          </CardContent>

          <AnimatePresence>
            {showSuggestion && suggestions.length > 0 && (
              <CardFooter>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md"
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
              </CardFooter>
            )}
          </AnimatePresence>
        </Card>

        <AnimatePresence>
          {particlePosition && <ParticleEffect x={particlePosition.x} y={particlePosition.y} />}
        </AnimatePresence>

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
