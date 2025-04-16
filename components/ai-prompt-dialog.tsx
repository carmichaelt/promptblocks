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
        onGenerate(object.content)
        setPrompt("")
        setSelectedRole(null)
        onOpenChange(false)
      }
    },
    onError: (error) => {
      console.error("Error generating content:", error)
    },
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    submit({
      blockType,
      blockLabel,
      userPrompt: prompt,
      systemPrompt: selectedRole?.systemPrompt,
      selectedModel,
    })
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
            Generate {blockLabel} Content
          </DialogTitle>
          <DialogDescription>
            Get AI assistance in creating high-quality content for your {blockTemplate?.title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="experts">Expert Roles</TabsTrigger>
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

          <TabsContent value="experts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleTemplates.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedRole?.id === role.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{role.label}</h3>
                    {selectedRole?.id === role.id && (
                      <Badge variant="secondary" className="ml-2">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{role.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.expertise.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-2 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Your Request</h3>
            {selectedRole && (
              <Badge variant="outline" className="text-xs">
                {selectedRole.label}
              </Badge>
            )}
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedRole
                ? `Describe what you want the ${selectedRole.label.toLowerCase()} to help you create...`
                : `Select an expert role above and describe what you want to create...`
            }
            className="min-h-32 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Using {selectedModel} to generate content.{" "}
            {selectedRole
              ? `The ${selectedRole.label} will help optimize your ${blockType} content.`
              : "Select an expert role for specialized assistance."}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || !selectedRole || isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? "Generating..." : "Generate with Expert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
