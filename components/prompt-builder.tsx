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
import { promptTemplates, blockConfigs } from "@/lib/prompt-config"
import type { PromptBlock, PromptTemplate } from "@/types/prompt-types"
import SavedPromptsDialog from "./saved-prompts-dialog"
import { PromptSuggestion } from "@/components/ui/prompt-suggestion"
import { Navbar } from "@/components/navbar"
import { Skeleton } from "@/components/ui/skeleton"
import { usePromptStore } from "@/lib/stores/prompt-store"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import TextareaAutosize from 'react-textarea-autosize'
import BlockInfoDialog from "./block-info-dialog"

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

  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null)
  const [savedPromptsOpen, setSavedPromptsOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [blockInfoDialogOpenIndex, setBlockInfoDialogOpenIndex] = useState<number | null>(null)
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
  const [generatingSingleBlockIndex, setGeneratingSingleBlockIndex] = useState<number | null>(null)
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

  const saveCurrentPrompt = (name: string) => {
    // Find the full template config to get the icon
    const currentTemplateConfig = promptTemplates.find(t => t.id === activeTemplate);
    if (!currentTemplateConfig) {
      console.error(`[PromptBuilder] Could not find template config for id: ${activeTemplate} during save.`);
      toast({ title: "Save Error", description: "Could not find current template configuration.", variant: "destructive" });
      return;
    }
    
    const newSavedPrompt = {
      name,
      template: {
        id: activeTemplate,
        name, // Use the user-provided name for the saved template
        description: "Custom saved prompt", // Or generate a description?
        blocks: [...blocks], // Copy current blocks state
        icon: currentTemplateConfig.icon, // Include the icon from the config
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
        // ISSUE 1 REVISITED: Parse the outer object first, then access .generatedBlocks
        // based on AllBlocksContentSchema: { generatedBlocks: Record<string, string> }
        const fullParsedResponse = JSON.parse(resultJson) as { generatedBlocks: Record<string, string> };
        
        // Ensure the expected structure is present
        if (!fullParsedResponse || typeof fullParsedResponse.generatedBlocks !== 'object') {
          console.error("[PromptBuilder] Invalid structure from /api/all-blocks. Expected { generatedBlocks: {...} }, got:", fullParsedResponse);
          throw new Error("Invalid response structure from AI for all blocks.");
        }

        const generatedBlocksMap = fullParsedResponse.generatedBlocks; // Access the nested map

        // ISSUE 2: Iterate through the generated map and update all relevant blocks
        let updatedCount = 0;
        Object.entries(generatedBlocksMap).forEach(([blockType, content]) => {
          // Find the first matching block index among those targeted for generation
          const blockIndexToUpdate = blocks.findIndex((block, index) => 
            indicesToGenerate.includes(index) && block.type === blockType
          );

          if (blockIndexToUpdate !== -1) {
            updateBlock(blockIndexToUpdate, content);
            updatedCount++;
          } else {
            console.warn(`[PromptBuilder] Received generated content for block type "${blockType}" but no corresponding empty/enabled block was targeted.`);
          }
        });

        if (updatedCount > 0) {
          toast({
            title: "Generation Finished",
            description: `${updatedCount} blocks generated successfully.`,
          })
        } else {
           // Handle cases where parsing worked but no blocks were actually updated
           // (e.g., AI returned types not in the indicesToGenerate list)
           toast({
             title: "Generation Complete",
             description: "AI response received, but no targeted blocks were updated.",
             variant: "default" // Use default variant, not necessarily an error
           })
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

  // Placeholder for single block generation logic
  const handleGenerateSingleBlock = async (index: number) => {
    if (generatingSingleBlockIndex !== null || isGeneratingAll) return // Prevent multiple generations

    const block = blocks[index]
    if (!block || !block.enabled) return

    console.log(`Triggering AI generation for block ${index}: ${block.label}`)
    setGeneratingSingleBlockIndex(index)
    toast({ title: "Generating...", description: `AI is generating content for "${block.label}".` })

    // Define a user prompt for single block generation. 
    // TODO: Consider making this more sophisticated, maybe using context from other blocks or a specific input.
    const singleBlockUserPrompt = `Generate content for the "${block.label}" block, considering its purpose: ${block.description || "Not specified"}.`;

    try {
      const response = await fetch('/api/block-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: block.type,
          blockLabel: block.label,
          userPrompt: singleBlockUserPrompt, 
          existingContent: block.content, // Send existing content for potential enhancement
          selectedModel: selectedModel, // Use the currently selected model
          // systemPrompt: undefined, // Let the API use its default or construct one
        }),
      });

      if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.statusText || response.status} - ${errorBody?.details || 'No details'}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let resultJson = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultJson += decoder.decode(value, { stream: true });
      }
      
      try {
        // The /api/block-content endpoint streams an object matching blockContentSchema: { content: string }
        console.log("[PromptBuilder] Raw response from /api/block-content:", resultJson);

        let parsedResult: any;
        try {
          parsedResult = JSON.parse(resultJson);
          console.log("[PromptBuilder] Parsed response object:", parsedResult);
        } catch (jsonError) {
          console.error("[PromptBuilder] JSON.parse failed:", jsonError);
          // Throw a more specific error if JSON parsing itself fails
          throw new Error(`Failed to parse JSON response: ${(jsonError as Error).message}`);
        }
        
        // Now check the structure of the successfully parsed object
        if (parsedResult && typeof parsedResult.content === 'string') {
           updateBlock(index, parsedResult.content);
           toast({ title: "Generation Complete", description: `Content generated for \"${block.label}\".` });
        } else {
          // Log the actual structure found if it's not as expected
          console.error("[PromptBuilder] Parsed response missing expected structure { content: string, ... }. Found:", parsedResult);
          throw new Error("Invalid content structure in parsed AI response"); // Keep this error distinct
        }
      } catch (parseError) {
         // This outer catch now primarily handles the structure error or the JSON.parse error re-thrown above
         console.error("Failed to process single block stream result:", parseError, "Raw content:", resultJson);
         // Ensure the error message reflects the actual issue caught
         throw new Error(`Failed to process AI response for single block: ${(parseError as Error).message}`);
      }

    } catch (error) {
      console.error(`Error generating single block content for index ${index}:`, error);
      toast({
        title: `Error Generating Content`,
        description: error instanceof Error ? error.message : "Generation failed.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSingleBlockIndex(null);
    }
  }

  const textColors = [
    "text-red-500",
    "text-blue-500",
    "text-green-500",
    "text-yellow-500",
    "text-purple-500",
    "text-pink-500",
    "text-indigo-500",
    "text-teal-500",
  ]

  // Define border colors
  const borderColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  // Map border colors to focus ring colors (explicitly list classes for Tailwind)
  const focusRingColors: { [key: string]: string } = {
    "bg-red-500": "focus:ring-red-500/50",
    "bg-blue-500": "focus:ring-blue-500/50",
    "bg-green-500": "focus:ring-green-500/50",
    "bg-yellow-500": "focus:ring-yellow-500/50",
    "bg-purple-500": "focus:ring-purple-500/50", // Keep purple as one option
    "bg-pink-500": "focus:ring-pink-500/50",
    "bg-indigo-500": "focus:ring-indigo-500/50",
    "bg-teal-500": "focus:ring-teal-500/50",
  };

  // Helper function to render the assembled prompt with interactive labels
  const renderAssembledPrompt = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
    }

    if (blocks.length === 0) {
      return <span className="italic text-slate-500 dark:text-slate-500">No blocks configured for this template...</span>;
    }

    return blocks.map((block, index) => {
      const borderColorClass = borderColors[index % borderColors.length]; // Cycle through colors
      const focusRingClass = focusRingColors[borderColorClass] || "focus:ring-purple-500/50"; // Get corresponding focus ring class, fallback to purple

      return (
      // Wrap block in a relative div for border positioning
      <div key={`${block.type}-${index}`} className="relative mb-6 pl-4 last:mb-0">
        {/* Colored Border */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-full", borderColorClass)}></div>

        {/* Block Header: Label and Toggle */}
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={`block-textarea-${index}`}
            className={cn(
              "ml-2 font-semibold text-base",
              block.enabled ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-500 italic"
            )}
          >
            {block.label} {block.enabled ? "" : "(Disabled)"}
          </label>
          <div className="flex items-center gap-2">
            {/* Moved Info/AI buttons here */}
            {block.enabled && (
              <>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setBlockInfoDialogOpenIndex(index)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-7 w-7"
                        aria-label={`Info about ${block.label}`}
                      >
                        <InfoIcon size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs leading-normal text-slate-700 dark:text-slate-300">
                      <p>{block.description || "No description available."}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateSingleBlock(index)}
                        disabled={generatingSingleBlockIndex === index || isGeneratingAll}
                        className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed h-7 w-7"
                        aria-label={`Generate content for ${block.label}`}
                      >
                        <Sparkles size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs leading-normal text-slate-700 dark:text-slate-300">
                      <p>{generatingSingleBlockIndex === index ? "Generating..." : "Generate with AI"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            <Switch
              checked={block.enabled}
              onCheckedChange={() => handleToggleBlock(index)}
              aria-label={`Toggle ${block.label} block`}
            />
          </div>
        </div>

        {/* Textarea or Placeholder */}
        <div className="relative"> {/* Container for Textarea + Buttons */}
          {block.enabled && ( // Only render textarea if block is enabled
            <TextareaAutosize
              id={`block-textarea-${index}`}
              value={block.content}
              onChange={(e) => handleUpdateBlock(index, e.target.value)}
              onFocus={() => setFocusedBlockIndex(index)}
              placeholder={`Enter content for ${block.label}...`}
              className={cn(
                "w-full min-h-[100px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 rounded-md p-2 text-sm leading-relaxed max-w-prose",
                "placeholder:text-slate-500 dark:placeholder:text-slate-500",
                focusRingClass
              )}
              style={{ overflow: 'hidden' }}
              ref={(el) => {
                if (el) {
                  blockRefs.current[index] = el; // Assign ref, ensure type
                }
              }}
              disabled={!block.enabled || isLoading || isGeneratingAll || generatingBlockIndices.includes(index)}
              aria-label={`${block.label} content`}
              minRows={3}
            />
          )}
          {!block.enabled && (
             <div className="italic text-slate-500 dark:text-slate-600 border border-dashed border-slate-300 dark:border-slate-700 rounded-md p-4 h-[100px] flex items-center justify-center text-sm leading-relaxed max-w-prose">
               Block content hidden when disabled.
             </div>
           )}
        </div>
      </div>
    )
  })
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
        isGenerating={isGeneratingAll}
        isCopied={isCopied}
      />

      {/* Template Description */}
      {promptTemplates.map(
        (template: PromptTemplate) =>
          template.id === activeTemplate && (
            <div key={`${template.id}-desc`} className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 md:mx-4">
              <span className="flex items-center gap-2">
                <InfoIcon size={20} className="text-slate-400 dark:text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-normal">{template.description}</p>
              </span>
            </div>
          ),
      )}

      {/* Main Content Area - Now Single Column */}
      <div className="w-full md:px-4"> {/* Removed flex container, adjusted padding */}
        {/* Right Column (now main content): Assembled Prompt & Editing Area */}
        <div className="w-full h-fit"> {/* Removed lg:w-1/2, lg:sticky, lg:top-24 */}
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-2 md:p-6 shadow-lg assembled-prompt border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Build Your {promptTemplates.find(t => t.id === activeTemplate)?.name || activeTemplate} Prompt</h2>
              <div className="flex gap-2">
                <Button 
                  onClick={copyPrompt} 
                  size="sm"
                  className={cn(
                    "w-fit shadow-sm transition-colors", 
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700 text-white"
                  )} 
                  disabled={isCopied}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-1 md:p-4 rounded text-sm"> {/* Removed overflow-y-auto */ }
              {/* Content is now rendered directly */}
              <TooltipProvider> {/* Added TooltipProvider wrapper */}
                {renderAssembledPrompt()}
              </TooltipProvider>
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
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Generate Content for Empty Blocks</DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 leading-normal pt-1">
              Enter the overall goal for the AI. Content will be generated for all empty, enabled blocks in the
              current template ('{promptTemplates.find(t => t.id === activeTemplate)?.name || activeTemplate}').
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <TextareaAutosize 
              id="goal-input"
              placeholder="e.g., Draft a technical blog post explaining React Server Components..."
              value={generateAllGoal}
              onChange={(e) => setGenerateAllGoal(e.target.value)}
              className="min-h-[100px] w-full resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500/20 placeholder:text-slate-500 dark:placeholder:text-slate-500 rounded-md p-2 text-sm leading-relaxed max-w-prose"
              style={{ overflow: 'hidden' }}
              minRows={3}
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

      {/* Render BlockInfoDialog using the dedicated component */}
      {blockInfoDialogOpenIndex !== null && (() => {
          const block = blocks[blockInfoDialogOpenIndex];
          const config = block ? blockConfigs[block.type] : undefined;
          const color = block ? textColors[blockInfoDialogOpenIndex % textColors.length] : undefined;

          // Only render if we have a valid config and color
          if (config && color) {
            return (
              <BlockInfoDialog
                open={true} // Open is controlled by the outer condition
                onOpenChange={(open) => !open && setBlockInfoDialogOpenIndex(null)}
                blockConfig={config}
                color={color} // Pass the calculated color
              />
            );
          }
          // Optional: Render something else or nothing if config/color is missing
          return null;
        })()
      }
    </div>
  )
}
