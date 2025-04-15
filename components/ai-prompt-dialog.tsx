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
import { experimental_useObject as useObject } from 'ai/react'
import { blockContentSchema } from '@/app/api/block-content/schema'
import { blockConfigs } from '@/lib/prompt-config'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { RoleTemplate } from "@/types/prompt-types"

const roleTemplates: RoleTemplate[] = [
  {
    id: "expert-dev",
    label: "Expert Developer",
    description: "AI/ML Development Expert",
    expertise: ["AI Development", "System Architecture", "Best Practices"],
    systemPrompt: "You are a senior AI developer with extensive experience in building production-grade AI systems. Focus on technical accuracy, best practices, and practical implementation details.",
  },
  {
    id: "pro-writer",
    label: "Professional Writer",
    description: "Technical Writing Expert",
    expertise: ["Technical Writing", "Documentation", "Clear Communication"],
    systemPrompt: "You are a professional technical writer specializing in AI documentation. Focus on clarity, structure, and making complex concepts accessible.",
  },
  {
    id: "prompt-engineer",
    label: "Prompt Engineer",
    description: "AI Prompt Engineering Expert",
    expertise: ["Prompt Design", "LLM Optimization", "Context Engineering"],
    systemPrompt: "You are an expert prompt engineer with deep knowledge of LLM behavior and optimization. Focus on creating effective, well-structured prompts that maximize model performance.",
  },
  {
    id: "ai-researcher",
    label: "AI Researcher",
    description: "AI/ML Research Expert",
    expertise: ["AI Research", "Model Behavior", "Technical Depth"],
    systemPrompt: "You are an AI researcher with deep knowledge of language models and their capabilities. Focus on theoretical correctness and detailed technical specifications.",
  }
]

interface AIPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (content: string) => void
  blockType: string
  blockLabel: string
}

export default function AIPromptDialog({ open, onOpenChange, onGenerate, blockType, blockLabel }: AIPromptDialogProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedRole, setSelectedRole] = useState<RoleTemplate | null>(null)
  const blockTemplate = blockConfigs[blockType]

  const { object, isLoading: isGenerating, submit, error } = useObject({
    api: '/api/block-content',
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
    }
  })

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    submit({
      blockType,
      blockLabel,
      userPrompt: prompt,
      systemPrompt: selectedRole?.systemPrompt
    })
  }

  const handleRoleSelect = (role: RoleTemplate) => {
    setSelectedRole(role)
    // Update prompt with role-specific starter if empty
    if (!prompt.trim()) {
      setPrompt(`As a ${role.label.toLowerCase()}, help me create a ${blockType} block that follows best practices for ${blockTemplate.title.toLowerCase()}...`)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate {blockLabel} Content</DialogTitle>
          <DialogDescription>
            Get AI assistance in creating high-quality content for your {blockTemplate?.title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Best Practices Section */}
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

          {/* Examples Section */}
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

          {/* Prompt Input */}
          <div className="grid gap-2">
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
              placeholder={selectedRole 
                ? `Describe what you want the ${selectedRole.label.toLowerCase()} to help you create...`
                : `Select an expert role above and describe what you want to create...`
              }
              className="min-h-32 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The selected expert will help optimize your {blockType} content based on their expertise and {blockTemplate?.title.toLowerCase()} best practices.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || !selectedRole || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate with Expert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
