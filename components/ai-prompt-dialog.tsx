"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { blockContentSchema } from "@/app/api/schema"
import { blockConfigs } from "@/lib/prompt-config"
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import type { RoleTemplate } from "@/types/prompt-types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const roleTemplates: RoleTemplate[] = [
  {
    id: "expert-dev",
    label: "Expert Developer",
    description: "AI/ML Development Expert",
    expertise: ["AI Development", "System Architecture", "Best Practices"],
    systemPrompt:
      "You are a senior AI developer with extensive experience in building production-grade AI systems. Focus on technical accuracy, best practices, and practical implementation details.",
  },
  {
    id: "pro-writer",
    label: "Professional Writer",
    description: "Technical Writing Expert",
    expertise: ["Technical Writing", "Documentation", "Clear Communication"],
    systemPrompt:
      "You are a professional technical writer specializing in AI documentation. Focus on clarity, structure, and making complex concepts accessible.",
  },
  {
    id: "prompt-engineer",
    label: "Prompt Engineer",
    description: "AI Prompt Engineering Expert",
    expertise: ["Prompt Design", "LLM Optimization", "Context Engineering"],
    systemPrompt:
      "You are an expert prompt engineer with deep knowledge of LLM behavior and optimization. Focus on creating effective, well-structured prompts that maximize model performance.",
  },
  {
    id: "ai-researcher",
    label: "AI Researcher",
    description: "AI/ML Research Expert",
    expertise: ["AI Research", "Model Behavior", "Technical Depth"],
    systemPrompt:
      "You are an AI researcher with deep knowledge of language models and their capabilities. Focus on theoretical correctness and detailed technical specifications.",
  },
]

interface AIPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (content: string) => void
  blockType: string
  blockLabel: string
  selectedModel: string
}

export default function AIPromptDialog({
  open,
  onOpenChange,
  onGenerate,
  blockType,
  blockLabel,
  selectedModel,
}: AIPromptDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleTemplate | null>(null)
  const [activeTab, setActiveTab] = useState("guidance")
  const [generationProgress, setGenerationProgress] = useState(0)
  const blockTemplate = blockConfigs[blockType]

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
        setGenerationProgress(100)
        setTimeout(() => {
          onGenerate(object.content)
          setPrompt("")
          setSelectedRole(null)
          setGenerationProgress(0)
          onOpenChange(false)
        }, 500)
      }
    },
    onError: (error) => {
      console.error("Error generating content:", error)
      setGenerationProgress(0)
    },
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerationProgress(20)

    submit({
      blockType,
      blockLabel,
      userPrompt: prompt,
      systemPrompt: selectedRole?.systemPrompt,
      selectedModel,
    })

    // Simulate progress for better UX
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 500)
  }

  const handleRoleSelect = (role: RoleTemplate) => {
    setSelectedRole(role)
    // Update prompt with role-specific starter if empty
    if (!prompt.trim()) {
      setPrompt(
        `As a ${role.label.toLowerCase()}, help me create a ${blockType} block that follows best practices for ${blockTemplate.title.toLowerCase()}...`,
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-500" />
            Need help with {blockLabel}?
          </DialogTitle>
          <DialogDescription>
            Get AI assistance in creating high-quality content for your {blockTemplate?.title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="guidance" className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                Best Practices for {blockTemplate?.title}
              </h3>
              <ul className="grid gap-2">
                {blockTemplate?.bestPractices.map((practice, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertCircle size={16} className="text-blue-500" />
                Example {blockTemplate?.title} Content
              </h3>
              <ul className="grid gap-2">
                {blockTemplate?.examples.map((example, index) => (
                  <li
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {example}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-2">Click any example to use it as a starting point</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-2 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Your Request</h3>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe what ${blockTemplate?.title} you need help with...`}
            className="min-h-32 font-mono text-sm"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            The more specific you are, the better the results will be
          </p>
        </div>

        {isGenerating && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Generating content...</span>
              <span className="text-sm text-muted-foreground">{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-1" />
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
