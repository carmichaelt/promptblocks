"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Settings, ChevronDown, Book, Save, Share2, Sparkles, History, Download, Upload, KeyboardIcon, InfoIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { promptTemplates, blockConfigs } from "@/lib/prompt-config"
import type { PromptBlock, PromptTemplate } from "@/types/prompt-types"
import PromptBlockComponent from "./prompt-block"
import KeyboardShortcutsGuide from "./keyboard-shortcuts-guide"
import SavedPromptsDialog from "./saved-prompts-dialog"
import AIModelSelector from "./ai-model-selector"
import OnboardingTour from "./onboarding-tour"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  onresult: (event: any) => void
  onerror: (event: any) => void
  start: () => void
  stop: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
  prototype: SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

// Define props for the component
interface PromptBuilderProps {
  initialTemplateId?: string
  initialBlocks?: PromptBlock[]
  selectedModelFromParent: string
  onModelChangeFromParent: (modelId: string) => void
}

export default function PromptBuilder({ 
  initialTemplateId, 
  initialBlocks, 
  selectedModelFromParent,
  onModelChangeFromParent,
}: PromptBuilderProps) {
  // Use initialTemplateId if provided, otherwise default
  // --- DEBUG LOG --- 
  console.log("[PromptBuilder] Initial Props Received:", { initialTemplateId, initialBlocks });
  // --- END DEBUG LOG ---

  const [activeTemplate, setActiveTemplate] = useState(initialTemplateId || "general")
  // Use initialBlocks if provided, otherwise empty array (will be populated by useEffect)
  const [blocks, setBlocks] = useState<PromptBlock[]>(initialBlocks || [])
  const [recordingBlockIndex, setRecordingBlockIndex] = useState<number | null>(null)
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null)
  const [savedPromptsOpen, setSavedPromptsOpen] = useState(false)
  const [savedPrompts, setSavedPrompts] = useState<{ name: string; template: PromptTemplate }[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  // Use model from parent prop
  const [selectedModel, setSelectedModel] = useState(selectedModelFromParent)
  const [showTour, setShowTour] = useState(false)
  const [promptHistory, setPromptHistory] = useState<{ timestamp: string; prompt: string }[]>([])
  const [showGenerateAllDialog, setShowGenerateAllDialog] = useState(false)
  const [generateAllGoal, setGenerateAllGoal] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const blockRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const blockContainerRefs = useRef<(HTMLDivElement | null)[]>([])

  // Initialize blocks from template or initial props
  useEffect(() => {
    // --- DEBUG LOG --- 
    console.log("[PromptBuilder useEffect] Running with:", { initialBlocks, initialTemplateId, currentActiveTemplate: activeTemplate });
    // --- END DEBUG LOG ---

    // Prioritize setting blocks from the initialBlocks prop if it exists and has content
    if (initialBlocks && initialBlocks.length > 0) {
      // --- DEBUG LOG --- 
      console.log("[PromptBuilder useEffect] Setting blocks from initialBlocks prop.");
      // --- END DEBUG LOG ---
      setBlocks(initialBlocks);
      // Ensure the active template ID matches the one provided, if any
      if (initialTemplateId && activeTemplate !== initialTemplateId) {
        // --- DEBUG LOG --- 
        console.log(`[PromptBuilder useEffect] Setting active template from initialTemplateId: ${initialTemplateId}`);
        // --- END DEBUG LOG ---
        setActiveTemplate(initialTemplateId);
      }
    } else if (!initialBlocks && activeTemplate) {
      // Fallback: If no initialBlocks are provided, load from the active template
      const template = promptTemplates.find((t: PromptTemplate) => t.id === activeTemplate);
      if (template) {
        // --- DEBUG LOG --- 
        console.log(`[PromptBuilder useEffect] Setting blocks from template: ${activeTemplate}`);
        // --- END DEBUG LOG ---
        setBlocks(template.blocks);
      }
    }
    // Else: Keep existing blocks if neither condition is met (e.g., initial load without template/blocks)

    // Load saved prompts from localStorage
    const savedPromptsData = localStorage.getItem("savedPrompts")
    if (savedPromptsData) {
      try {
        setSavedPrompts(JSON.parse(savedPromptsData))
      } catch (e) {
        console.error("Failed to parse saved prompts", e)
      }
    }

    // Check if this is first visit
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")
    if (!hasVisitedBefore) {
      setShowTour(true)
      localStorage.setItem("hasVisitedBefore", "true")
    }

    // Load prompt history
    const historyData = localStorage.getItem("promptHistory")
    if (historyData) {
      try {
        setPromptHistory(JSON.parse(historyData))
      } catch (e) {
        console.error("Failed to parse prompt history", e)
      }
    }
  }, [activeTemplate, initialBlocks, initialTemplateId])

  // Sync model state with parent
  useEffect(() => {
    setSelectedModel(selectedModelFromParent);
  }, [selectedModelFromParent]);

  // Callback to update parent model state
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId); 
    onModelChangeFromParent(modelId);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + C to copy the prompt
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !window.getSelection()?.toString()) {
        e.preventDefault()
        copyPrompt()
      }

      // Tab navigation between blocks
      if (e.key === "Tab" && focusedBlockIndex !== null) {
        e.preventDefault()
        const nextIndex = e.shiftKey
          ? Math.max(0, focusedBlockIndex - 1)
          : Math.min(blocks.length - 1, focusedBlockIndex + 1)
        setFocusedBlockIndex(nextIndex)
        blockRefs.current[nextIndex]?.focus()
      }

      // Alt + number to focus specific block
      if (e.altKey && !isNaN(Number.parseInt(e.key)) && Number.parseInt(e.key) > 0) {
        const index = Number.parseInt(e.key) - 1
        if (index < blocks.length) {
          e.preventDefault()
          setFocusedBlockIndex(index)
          blockRefs.current[index]?.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [blocks, focusedBlockIndex])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        if (recordingBlockIndex !== null) {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("")

          setBlocks((prev) =>
            prev.map((block, index) => (index === recordingBlockIndex ? { ...block, content: transcript } : block)),
          )
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setRecordingBlockIndex(null)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleRecording = (index: number) => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    if (recordingBlockIndex === index) {
      // Stop recording for this block
      recognitionRef.current.stop()
      setRecordingBlockIndex(null)
    } else {
      // Stop any existing recording
      if (recordingBlockIndex !== null) {
        recognitionRef.current.stop()
      }

      // Start recording for this block
      setRecordingBlockIndex(index)
      setFocusedBlockIndex(index)
      blockRefs.current[index]?.focus()
      recognitionRef.current.start()
    }
  }

  const toggleBlockEnabled = (index: number) => {
    setBlocks((prev) => prev.map((block, i) => (i === index ? { ...block, enabled: !block.enabled } : block)))
  }

  const updateBlockContent = (index: number, content: string) => {
    setBlocks((prev) => prev.map((block, i) => (i === index ? { ...block, content } : block)))
  }

  const assemblePrompt = () => {
    return blocks
      .filter((block) => block.enabled)
      .map((block) => {
        if (block.type === "examples") {
          return `${block.label}:\n${block.content}`
        }
        return `${block.label}: ${block.content}`
      })
      .join("\n\n")
  }

  const copyPrompt = () => {
    const prompt = assemblePrompt()
    navigator.clipboard.writeText(prompt)

    // Add to history
    const newHistoryItem = {
      timestamp: new Date().toISOString(),
      prompt,
    }

    const updatedHistory = [newHistoryItem, ...promptHistory].slice(0, 10) // Keep only last 10
    setPromptHistory(updatedHistory)
    localStorage.setItem("promptHistory", JSON.stringify(updatedHistory))

    toast({
      title: "Prompt Copied",
      description: "The assembled prompt has been copied to your clipboard.",
    })
  }

  const saveCurrentPrompt = (name: string) => {
    const newSavedPrompt = {
      name,
      template: {
        id: `custom-${Date.now()}`,
        name,
        description: "Custom saved prompt",
        blocks: [...blocks],
      },
    }

    const updatedSavedPrompts = [...savedPrompts, newSavedPrompt]
    setSavedPrompts(updatedSavedPrompts)
    localStorage.setItem("savedPrompts", JSON.stringify(updatedSavedPrompts))

    toast({
      title: "Prompt Saved",
      description: `Your prompt has been saved as "${name}"`,
    })
  }

  const loadSavedPrompt = (template: PromptTemplate) => {
    setBlocks(template.blocks)
    setSavedPromptsOpen(false)

    toast({
      title: "Prompt Loaded",
      description: "Your saved prompt has been loaded successfully",
    })
  }

  const deleteSavedPrompt = (name: string) => {
    const updatedSavedPrompts = savedPrompts.filter((prompt) => prompt.name !== name)
    setSavedPrompts(updatedSavedPrompts)
    localStorage.setItem("savedPrompts", JSON.stringify(updatedSavedPrompts))

    toast({
      title: "Prompt Deleted",
      description: `"${name}" has been deleted from your saved prompts`,
    })
  }

  // Extracted core logic for generating all blocks
  const executeGenerateAll = async (overallGoal: string) => {
    if (!overallGoal || !overallGoal.trim()) {
      toast({ title: "Goal Required", description: "Generation requires an overall goal.", variant: "destructive" })
      return
    }
    
    setShowGenerateAllDialog(false) // Close the dialog
    setIsGeneratingAll(true)
    toast({ title: "Starting Generation", description: `Generating content for template '${activeTemplate}' using ${selectedModel}...` })

    // Identify initially empty enabled blocks to update later
    const initiallyEmptyEnabledBlockIndices = blocks
      .map((block, index) => ({ ...block, index }))
      .filter((block) => block.enabled && !block.content.trim())
      .map((block) => block.index)

    if (initiallyEmptyEnabledBlockIndices.length === 0) {
      toast({ title: "No Empty Blocks", description: "All enabled blocks already have content." })
      setIsGeneratingAll(false)
      return
    }

    try {
      const response = await fetch("/api/all-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: overallGoal,
          templateId: activeTemplate,
          selectedModel: selectedModel,
        }),
      })

      if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(`API error: ${response.statusText || response.status} - ${errorBody?.details || "No details"}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let resultJson = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        resultJson += decoder.decode(value, { stream: true })
      }

      try {
        const finalParsed = JSON.parse(resultJson)
        if (finalParsed && typeof finalParsed.generatedBlocks === "object") {
          const generatedBlocksMap = finalParsed.generatedBlocks as Record<string, string>

          setBlocks((prevBlocks) =>
            prevBlocks.map((block, index) => {
              if (initiallyEmptyEnabledBlockIndices.includes(index) && generatedBlocksMap[block.type]) {
                return { ...block, content: generatedBlocksMap[block.type] }
              }
              return block
            }),
          )

          const updatedCount = Object.keys(generatedBlocksMap).filter((type) =>
            blocks.some((b, i) => initiallyEmptyEnabledBlockIndices.includes(i) && b.type === type),
          ).length

          toast({
            title: "Generation Finished",
            description: `${updatedCount} blocks generated successfully.`,
          })
        } else {
          throw new Error("Invalid content structure in parsed response")
        }
      } catch (parseError) {
        console.error("Failed to parse stream result:", parseError, "Raw content:", resultJson)
        throw new Error("Failed to parse AI response.")
      }
    } catch (error) {
      console.error(`Error generating all blocks:`, error)
      toast({
        title: `Error Generating Blocks`,
        description: error instanceof Error ? error.message : "Generation failed.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAll(false)
      setGenerateAllGoal("") // Clear the goal input after attempt
    }
  }

  // Trigger for opening the dialog
  const handleGenerateAllClick = () => {
    // Check if there are empty enabled blocks before opening dialog
    const hasEmptyEnabledBlocks = blocks.some(block => block.enabled && !block.content.trim());
    if (!hasEmptyEnabledBlocks) {
      toast({ title: "No Empty Blocks", description: "All enabled blocks already have content." });
      return;
    }
    setShowGenerateAllDialog(true)
  }

  const sharePrompt = () => {
    // Create a shareable URL or copy to clipboard
    const promptData = {
      blocks: blocks,
      template: activeTemplate,
      model: selectedModel,
    }

    const shareableData = btoa(JSON.stringify(promptData))
    const shareableUrl = `${window.location.origin}?prompt=${shareableData}`

    navigator.clipboard.writeText(shareableUrl)

    toast({
      title: "Share Link Created",
      description: "A shareable link to this prompt has been copied to your clipboard",
    })
  }

  const exportPrompt = () => {
    const promptData = {
      blocks: blocks,
      template: activeTemplate,
      model: selectedModel,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(promptData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportName = `promptblocks_${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportName)
    linkElement.click()

    toast({
      title: "Prompt Exported",
      description: "Your prompt has been exported as a JSON file",
    })
  }

  const importPrompt = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.blocks && Array.isArray(data.blocks)) {
            setBlocks(data.blocks)
            if (data.template && promptTemplates.some((t) => t.id === data.template)) {
              setActiveTemplate(data.template)
            }
            if (data.model) {
              setSelectedModel(data.model)
            }

            toast({
              title: "Prompt Imported",
              description: "Your prompt has been successfully imported",
            })
          } else {
            throw new Error("Invalid prompt format")
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "The selected file is not a valid prompt file",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  // Tour steps for onboarding
  interface TourStep {
    target: string
    title: string
    content: string
    position: "top" | "right" | "bottom" | "left"
  }

  const tourSteps: TourStep[] = [
    {
      target: ".template-selector",
      title: "Choose a Template",
      content: "Start by selecting a template that fits your needs. Each template is designed for different use cases.",
      position: "bottom",
    },
    {
      target: ".prompt-block",
      title: "Customize Blocks",
      content: "Each block represents a part of your prompt. Toggle blocks on/off and edit their content.",
      position: "right",
    },
    {
      target: ".ai-button",
      title: "AI Generation",
      content: "Use AI to generate or enhance content for each block. Click the sparkle icon to get started.",
      position: "left",
    },
    {
      target: ".assembled-prompt",
      title: "Your Finished Prompt",
      content: "Your assembled prompt appears here. Copy it to use with any AI system.",
      position: "top",
    },
  ]

  // --- DEBUG LOG ---
  console.log("[PromptBuilder] Rendering with blocks state:", blocks);
  // --- END DEBUG LOG ---

  return (
    <div className="w-full py-8 px-4 sm:px-6 md:px-8">
      {/* Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        {/* Left Side: Template & Model Selection */}
        <div className="w-full md:w-auto flex flex-col gap-4 flex-shrink-0 md:max-w-xs">
          <div className="template-selector">
            <Select value={activeTemplate} onValueChange={setActiveTemplate}>
              <SelectTrigger className="w-full bg-white/90 dark:bg-slate-800/90 shadow-sm">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {promptTemplates.map((template: PromptTemplate) => (
                  <SelectItem key={template.id} value={template.id} className="cursor-pointer">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Template Description */}
          {promptTemplates.map(
            (template: PromptTemplate) =>
              template.id === activeTemplate && (
                <div key={`${template.id}-desc`} className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">{template.description}</p>
                </div>
              ),
          )}
          {/* AI Model Selector */}
          <div>
            <AIModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} />
          </div>
        </div>

        {/* Right Side: Action Buttons - Grouped */}
        <div className="w-full md:w-auto flex flex-wrap justify-start md:justify-end items-start gap-2">
            {/* Management & Generation Buttons */}
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 dark:bg-slate-800/90 shimmer-button shadow-sm"
              onClick={() => setSavedPromptsOpen(true)}
            >
              <Save size={16} className="mr-2" />
              Save/Load
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 dark:bg-slate-800/90 shimmer-button shadow-sm"
              onClick={sharePrompt}
            >
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
             <Button
              variant="outline"
              size="sm"
              className="bg-white/90 dark:bg-slate-800/90 shimmer-button shadow-sm"
              onClick={exportPrompt}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 dark:bg-slate-800/90 shimmer-button shadow-sm"
              onClick={importPrompt}
            >
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 dark:bg-slate-800/90 shimmer-button ai-button shadow-sm"
              onClick={handleGenerateAllClick}
              disabled={isGeneratingAll}
            >
              <Sparkles size={16} className="mr-2" />
              {isGeneratingAll ? "Generating..." : "Generate All Empty"}
            </Button>
            {/* Utility Buttons */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/90 dark:bg-slate-800/90 shadow-sm">
                  <InfoIcon size={16} className="mr-2" />
                  Shortcuts
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Keyboard Shortcuts</DialogTitle>
                  <DialogDescription>
                    Use these shortcuts to navigate the prompt builder more efficiently.
                  </DialogDescription>
                </DialogHeader>
                <KeyboardShortcutsGuide />
              </DialogContent>
            </Dialog>
            {/* Primary Action Button */}
            <Button onClick={copyPrompt} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
              <Copy size={16} className="mr-2" />
              Copy Full Prompt
            </Button>
        </div>
      </div>

      {/* Main Content Area: Responsive Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Prompt Blocks */}
        <div className="lg:w-1/2 space-y-8">
          <AnimatePresence>
            {blocks.map((block, index) => (
              <motion.div
                key={`${block.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                ref={(el) => {
                  if (el) {
                    blockContainerRefs.current[index] = el as HTMLDivElement
                  }
                }}
                className="prompt-block"
              >
                <div className={cn("transition-opacity", !block.enabled && "opacity-50")}>
                  <PromptBlockComponent
                    block={block}
                    index={index}
                    isFocused={focusedBlockIndex === index}
                    isDisabled={!block.enabled}
                    onChange={(content) => updateBlockContent(index, content)}
                    onFocus={() => setFocusedBlockIndex(index)}
                    onToggle={() => toggleBlockEnabled(index)}
                    isRecording={recordingBlockIndex === index}
                    onRecordingToggle={() => toggleRecording(index)}
                    selectedModel={selectedModel}
                    ref={(el) => {
                      if (el) {
                        blockRefs.current[index] = el
                      }
                    }}
                  />
                </div>

                {/* Arrow indicator between blocks */}
                {index < blocks.length - 1 && (
                  <div className="flex justify-center my-4">
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={cn(
                        "w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center shadow-sm",
                        (!block.enabled || !blocks[index + 1].enabled) && "opacity-40",
                      )}
                    >
                      <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400 arrow-icon" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Column: Assembled Prompt (Sticky on Large Screens) */}
        <div className="lg:w-1/2 lg:sticky lg:top-8 h-fit">
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-6 shadow-sm pulse-container assembled-prompt">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assembled Prompt</h2>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white/90 dark:bg-slate-800/90">
                      <History size={16} className="mr-2" />
                      History
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Prompt History</DialogTitle>
                      <DialogDescription>Your recent prompts are saved here. Click one to copy it.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {promptHistory.length > 0 ? (
                        promptHistory.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(item.prompt)
                              toast({
                                title: "Copied to Clipboard",
                                description: "Historical prompt copied to clipboard",
                              })
                            }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                              <Button variant="ghost" size="sm">
                                <Copy size={14} />
                              </Button>
                            </div>
                            <p className="text-sm line-clamp-2">{item.prompt}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-500 py-4">No prompt history yet</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPrompt}
                  className="bg-white/90 dark:bg-slate-800/90 shimmer-button"
                >
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 text-sm">
              {assemblePrompt() || "Your prompt will appear here as you build it..."}
            </pre>
          </div>
        </div>
      </div>

      <SavedPromptsDialog
        open={savedPromptsOpen}
        onOpenChange={setSavedPromptsOpen}
        onLoad={loadSavedPrompt}
        onSave={saveCurrentPrompt}
        savedPrompts={savedPrompts}
        onDelete={deleteSavedPrompt}
      />

      <OnboardingTour steps={tourSteps} isOpen={showTour} onClose={() => setShowTour(false)} />

      {/* Generate All Blocks Dialog */}
      <Dialog open={showGenerateAllDialog} onOpenChange={setShowGenerateAllDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Content for Empty Blocks</DialogTitle>
            <DialogDescription>
              Enter the overall goal for the AI. Content will be generated for all empty, enabled blocks in the
              current template ('{promptTemplates.find(t => t.id === activeTemplate)?.name || activeTemplate}').
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              id="goal-input"
              placeholder="e.g., Create a marketing email for a new product launch..."
              value={generateAllGoal}
              onChange={(e) => setGenerateAllGoal(e.target.value)}
              className="min-h-[100px]" // Ensure textarea has some height
            />
            {/* ScrollArea might be useful if displaying results here, but not needed for input Textarea */}
            {/* <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              Potential results display area
            </ScrollArea> */}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={() => executeGenerateAll(generateAllGoal)} disabled={isGeneratingAll || !generateAllGoal.trim()}>
              {isGeneratingAll ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
