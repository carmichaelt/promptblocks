"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Settings, ChevronDown, Book, Save, Share2, Sparkles, History, Download, Upload, KeyboardIcon, InfoIcon, Check, Badge } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { promptTemplates } from "@/lib/prompt-config"
import type { PromptBlock, PromptTemplate } from "@/types/prompt-types"
import PromptBlockComponent from "./prompt-block"
import SavedPromptsDialog from "./saved-prompts-dialog"
import { Textarea } from "@/components/ui/textarea"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { Navbar } from "@/components/navbar"
import { Skeleton } from "@/components/ui/skeleton"
import { usePromptStore } from "@/lib/stores/prompt-store"

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
  // Replace state with store
  const {
    blocks,
    activeTemplate,
    isLoading,
    loadInitialData,
    loadSavedPrompt,
    loadFromHistory,
    updateBlock,
    toggleBlock,
    setActiveTemplate,
  } = usePromptStore()

  const [recordingBlockIndex, setRecordingBlockIndex] = useState<number | null>(null)
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null)
  const [savedPromptsOpen, setSavedPromptsOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [savedPrompts, setSavedPrompts] = useState<{ name: string; template: PromptTemplate }[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [generatingBlockIndices, setGeneratingBlockIndices] = useState<number[]>([])
  const [selectedModel, setSelectedModel] = useState(selectedModelFromParent)
  const [showTour, setShowTour] = useState(false)
  const [promptHistory, setPromptHistory] = useState<{ 
    timestamp: string; 
    prompt: string;
    blocks: PromptBlock[];
    template: string;
  }[]>([])
  const [showGenerateAllDialog, setShowGenerateAllDialog] = useState(false)
  const [generateAllGoal, setGenerateAllGoal] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const blockRefs = useRef<Array<HTMLTextAreaElement | null>>([])
  const blockContainerRefs = useRef<Array<HTMLDivElement | null>>([])

  // Handle initial load
  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      loadInitialData(initialTemplateId || 'general', initialBlocks)
    } else if (initialTemplateId) {
      setActiveTemplate(initialTemplateId)
    } else {
      setActiveTemplate('general')
    }
  }, []) // Only run on mount

  // Load saved prompts from localStorage
  useEffect(() => {
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

    // Load prompt history with safe parsing
    const historyData = localStorage.getItem("promptHistory")
    if (historyData) {
      try {
        const parsedHistory = JSON.parse(historyData)
        // Ensure each history item has the required properties
        const validatedHistory = parsedHistory.map((item: any) => ({
          timestamp: item.timestamp || new Date().toISOString(),
          prompt: item.prompt || "",
          blocks: Array.isArray(item.blocks) ? item.blocks : [],
          template: item.template || "general"
        })).filter((item: any) => item.prompt) // Only keep items with actual prompts
        setPromptHistory(validatedHistory)
      } catch (e) {
        console.error("Failed to parse prompt history", e)
        setPromptHistory([]) // Reset to empty array on error
      }
    }
  }, [])

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

          updateBlock(recordingBlockIndex, transcript)
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

  const handleUpdateBlock = (index: number, content: string) => {
    updateBlock(index, content)
  }

  const handleToggleBlock = (index: number) => {
    toggleBlock(index)
  }

  const handleTemplateChange = (templateId: string) => {
    setActiveTemplate(templateId)
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

    // Set copied state and reset after 2 seconds
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)

    // Add to history with blocks and template
    const newHistoryItem = {
      timestamp: new Date().toISOString(),
      prompt,
      blocks: [...blocks],
      template: activeTemplate
    }

    const updatedHistory = [newHistoryItem, ...promptHistory].slice(0, 10) // Keep only last 10
    setPromptHistory(updatedHistory)
    localStorage.setItem("promptHistory", JSON.stringify(updatedHistory))

    toast({
      title: "Prompt Copied",
      description: "The assembled prompt has been copied to your clipboard.",
    })
  }

  const handleLoadSavedPrompt = (template: PromptTemplate) => {
    loadSavedPrompt(template)
    setSavedPromptsOpen(false)
    toast({
      title: "Prompt Loaded",
      description: "Your saved prompt has been loaded successfully",
    })
  }

  const handleLoadFromHistory = (historyItem: typeof promptHistory[0]) => {
    if (!historyItem) return
    loadFromHistory(historyItem.template, historyItem.blocks)
    setHistoryDialogOpen(false)
    toast({
      title: "Prompt Loaded",
      description: "Historical prompt has been loaded successfully",
    })
  }

  const saveCurrentPrompt = (name: string) => {
    const newSavedPrompt = {
      name,
      template: {
        id: activeTemplate,
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

    // Identify initially empty enabled blocks to update later
    const indicesToGenerate = blocks
      .map((block, index) => ({ ...block, index }))
      .filter((block) => block.enabled && !block.content.trim())
      .map((block) => block.index)

    if (indicesToGenerate.length === 0) {
      toast({ title: "No Empty Blocks", description: "All enabled blocks already have content." })
      setIsGeneratingAll(false)
      return
    }

    setGeneratingBlockIndices(indicesToGenerate) // Set indices being generated
    toast({ title: "Starting Generation", description: `Generating content for ${indicesToGenerate.length} blocks using ${selectedModel}...` })

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

          updateBlock(generatingBlockIndices[0], generatedBlocksMap[blocks[generatingBlockIndices[0]].type])

          const updatedCount = Object.keys(generatedBlocksMap).filter((type) =>
            blocks.some((b, i) => indicesToGenerate.includes(i) && b.type === type),
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
      setGeneratingBlockIndices([]) // Clear indices on finish/error
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
    // Assemble the prompt content
    const promptContent = assemblePrompt()
    
    // Create email content with proper formatting
    const subject = encodeURIComponent("Shared Prompt from PromptBlocks")
    const body = encodeURIComponent(promptContent)
    
    // Open default email client with pre-filled content
    window.location.href = `mailto:?subject=${subject}&body=${body}`

    toast({
      title: "Email Client Opened",
      description: "An email draft has been created with your prompt",
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
            updateBlock(0, data.blocks[0].content)
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

  // Function to handle scrolling to a specific block
  const handleScrollToBlock = (index: number) => {
    blockContainerRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => blockRefs.current[index]?.focus(), 300); // Delay focus slightly after scroll
  };

  // Helper function to render the assembled prompt with interactive labels
  const renderAssembledPrompt = () => {
    const assembledParts = blocks
      .filter((block) => block.enabled)
      .map((block, index) => {
        const globalIndex = blocks.findIndex(b => b === block); // Find original index for refs
        return (
          <div key={globalIndex} className="mb-4 last:mb-0">
            <button
              className="text-left font-semibold text-purple-600 dark:text-purple-400 hover:underline focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 py-0.5 mb-1"
              onClick={() => handleScrollToBlock(globalIndex)}
              aria-label={`Go to ${block.label} block`}
            >
                {block.label}

            </button>
            <div>
            <span className="whitespace-pre-wrap"> {block.content || <span className='italic text-slate-400 dark:text-slate-600'>empty</span>}</span>
            </div>
          </div>
        )
      });

    if (assembledParts.length === 0) {
      return <span className="italic text-slate-500 dark:text-slate-500">Your prompt will appear here as you build it...</span>;
    }

    return assembledParts;
  };

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
    <div className="w-full space-y-6">
      <Navbar
        activeTemplate={activeTemplate}
        templates={promptTemplates}
        onTemplateChange={handleTemplateChange}
        onSaveLoad={() => setSavedPromptsOpen(true)}
        onShare={sharePrompt}
        onExport={exportPrompt}
        onImport={importPrompt}
        onGenerateAll={handleGenerateAllClick}
        onCopy={copyPrompt}
        isGenerating={isGeneratingAll}
        isCopied={isCopied}
      />

      {/* Template Description */}
      {promptTemplates.map(
        (template: PromptTemplate) =>
          template.id === activeTemplate && (
            <div key={`${template.id}-desc`} className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 md:mx-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">{template.description}</p>
            </div>
          ),
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8 md:px-4">
        {/* Left Column: Prompt Blocks */}
        <div className="lg:w-1/2 space-y-6">
          <AnimatePresence>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </motion.div>
              ))
            ) : (
              blocks.map((block, index) => (
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
                  <PromptBlockComponent
                    block={block}
                    index={index}
                    isFocused={focusedBlockIndex === index}
                    isDisabled={!block.enabled}
                    isAwaitingGeneration={generatingBlockIndices.includes(index)}
                    onChange={(content) => handleUpdateBlock(index, content)}
                    onFocus={() => setFocusedBlockIndex(index)}
                    onToggle={() => handleToggleBlock(index)}
                    isRecording={recordingBlockIndex === index}
                    onRecordingToggle={() => toggleRecording(index)}
                    selectedModel={selectedModel}
                    ref={(el) => {
                      if (el) {
                        blockRefs.current[index] = el
                      }
                    }}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Assembled Prompt */}
        <div className="lg:w-1/2 lg:sticky lg:top-24 h-fit">
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-1 md:p-6 shadow-sm pulse-container assembled-prompt">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assembled Prompt</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryDialogOpen(true)}
                className="bg-white/90 dark:bg-slate-800/90"
              >
                <History size={16} className="mr-2" />
                History
              </Button>
            </div>
            <div className="bg-white dark:bg-slate-900 p-1 md:p-4 rounded border border-slate-200 dark:border-slate-700 text-sm overflow-y-auto max-h-[60vh]">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                renderAssembledPrompt()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Existing dialogs */}
      <SavedPromptsDialog
        open={savedPromptsOpen}
        onOpenChange={setSavedPromptsOpen}
        onLoad={handleLoadSavedPrompt}
        onSave={saveCurrentPrompt}
        savedPrompts={savedPrompts}
        onDelete={deleteSavedPrompt}
      />

      
      {/* Generate All Dialog */}
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
              placeholder="e.g., Draft a technical blog post explaining React Server Components..."
              value={generateAllGoal}
              onChange={(e) => setGenerateAllGoal(e.target.value)}
              className="min-h-[100px] resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <PromptSuggestion 
                size="sm" 
                className="w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                           border border-slate-200/50 dark:border-slate-700/50
                           shadow-sm hover:shadow-md dark:shadow-none
                           transition-all duration-200
                           hover:scale-[1.02] active:scale-[0.98]
                           dark:hover:bg-slate-800"
                onClick={() => setGenerateAllGoal("Create a Python script for data analysis")}
              >
                Data Analysis Script
              </PromptSuggestion>
              <PromptSuggestion 
                size="sm" 
                className="w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                           border border-slate-200/50 dark:border-slate-700/50
                           shadow-sm hover:shadow-md dark:shadow-none
                           transition-all duration-200
                           hover:scale-[1.02] active:scale-[0.98]
                           dark:hover:bg-slate-800"
                onClick={() => setGenerateAllGoal("Explain a complex topic simply")}
              >
                Explain Complex Topic
              </PromptSuggestion>
              <PromptSuggestion 
                size="sm" 
                className="w-full sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                           border border-slate-200/50 dark:border-slate-700/50
                           shadow-sm hover:shadow-md dark:shadow-none
                           transition-all duration-200
                           hover:scale-[1.02] active:scale-[0.98]
                           dark:hover:bg-slate-800"
                onClick={() => setGenerateAllGoal("Draft a professional email response")}
              >
                Draft Email Response
              </PromptSuggestion>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={() => executeGenerateAll(generateAllGoal)} 
              disabled={isGeneratingAll || !generateAllGoal.trim()}
              className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                         text-white shadow-lg hover:shadow-xl transition-all duration-200
                         disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
            >
              {isGeneratingAll ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
