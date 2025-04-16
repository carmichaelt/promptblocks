"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Settings, ChevronDown, Book } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { promptTemplates } from "@/lib/prompt-config"
import type { PromptBlock, PromptTemplate } from "@/types/prompt-types"
import PromptBlockComponent from "./prompt-block"
//import BlockConnection from "./block-connection"
import KeyboardShortcutsGuide from "./keyboard-shortcuts-guide"

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default function PromptBuilder() {
  const [activeTemplate, setActiveTemplate] = useState("general")
  const [blocks, setBlocks] = useState<PromptBlock[]>([])
  const [recordingBlockIndex, setRecordingBlockIndex] = useState<number | null>(null)
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const blockRefs = useRef<(HTMLTextAreaElement | null)[]>([])
  const blockContainerRefs = useRef<(HTMLDivElement | null)[]>([])

  // Initialize blocks from template
  useEffect(() => {
    const template = promptTemplates.find((t: PromptTemplate) => t.id === activeTemplate)
    if (template) {
      setBlocks(template.blocks)
    }
  }, [activeTemplate])

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
    toast({
      title: "Prompt Copied",
      description: "The assembled prompt has been copied to your clipboard.",
    })
  }

  return (
    <div className="w-full py-8 px-4 sm:px-6 md:px-8">
      <div className="absolute top-4 left-4 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://cloud.google.com/discover/what-is-prompt-engineering"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md hover:shadow-lg transition-all"
              >
                <Book size={20} className="text-slate-700 dark:text-slate-300" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p>Learn more about prompting from Google's Prompt Engineering for AI Guide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      
      <div className="flex justify-end gap-2 mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white/90 dark:bg-slate-800/90">
              <Settings size={18} />
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

        <Button onClick={copyPrompt} className="bg-purple-600 hover:bg-purple-700">
          <Copy size={18} className="mr-2" />
          Copy Prompt
        </Button>

      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          PromptBlocks
        </h1>
        <p className="font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">Build powerful AI prompts by assembling specialized blocks</p>
      </motion.div>

      <div className="flex justify-between items-center mb-6">
        <div className="w-full max-w-xs">
          <Select value={activeTemplate} onValueChange={setActiveTemplate}>
            <SelectTrigger className="w-full bg-white/90 dark:bg-slate-800/90">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {promptTemplates.map((template: PromptTemplate) => (
                <SelectItem 
                  key={template.id} 
                  value={template.id}
                  className="cursor-pointer"
                >
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {promptTemplates.map((template: PromptTemplate) => (
            template.id === activeTemplate && (
              <div key={template.id} className="mt-4 bg-white/90 dark:bg-slate-800/90 rounded-lg p-4 shadow-sm">
                <p className="text-sm text-slate-700 dark:text-slate-300">{template.description}</p>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="space-y-8 mb-8">
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
                  ref={(el) => {
                    if (el) {
                      blockRefs.current[index] = el
                    }
                  }}
                />
              </div>

              {/* Block connections }
              {index < blocks.length - 1 && blockContainerRefs.current[index] && blockContainerRefs.current[index + 1] && (
                <BlockConnection
                  startElement={blockContainerRefs.current[index]!}
                  endElement={blockContainerRefs.current[index + 1]!}
                  isEnabled={block.enabled && blocks[index + 1].enabled}
                />
              )}*/}

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

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Assembled Prompt</h2>
          <Button variant="outline" size="sm" onClick={copyPrompt} className="bg-white/90 dark:bg-slate-800/90">
            <Copy size={16} className="mr-2" />
            Copy
          </Button>
        </div>
        <pre className="whitespace-pre-wrap bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700 text-sm">
          {assemblePrompt() || "Your prompt will appear here as you build it..."}
        </pre>
      </div>
    </div>
  )
}
