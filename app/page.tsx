"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SimplePromptInput from "@/components/simple-prompt-input"
import type { PromptBlock } from "@/types/prompt-types"
import { Metadata } from "next"

// Assuming you have a way to get available models, e.g., from config
const availableModels = ["grok-3-mini", "grok-3-large", "gpt-4", "claude-3"]

export const metadata: Metadata = {
  title: "PromptBlocks - Quick Prompt",
  description: "Let us craft the perfect prompt for you",
}

export default function QuickPromptPage() {
  const [selectedModel, setSelectedModel] = useState(availableModels[0])
  const router = useRouter()

  const handleGenerationComplete = (data: {
    templateId: string
    blocks: PromptBlock[]
  }) => {
    // Store the data in localStorage for the builder page to pick up
    localStorage.setItem("quickPromptData", JSON.stringify(data))
    router.push("/builder")
  }

  return (
    <div className="container mx-auto px-1 md:px-4 mb-12">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          Quick Prompt
        </h1>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
          Let us craft the perfect prompt for you
        </p>
      </div>

      {/* Quick Prompt Input */}
      <div className="mx-auto w-full mb-16">
        <SimplePromptInput
          onGenerationComplete={handleGenerationComplete}
          availableModels={availableModels}
          selectedModel={selectedModel}
        />
      </div>

      {/* How It Works Section */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-700 
                        border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                Describe Your Goal
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Start by describing what you want to achieve in simple terms. Our AI will understand your intent and create the perfect prompt structure.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-700 
                        border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold">
                2
              </span>
              <h3 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                Customize Blocks
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Review and refine the generated prompt blocks. Each block is designed to extract specific information needed for your goal.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700/50 dark:to-slate-700 
                        border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold">
                3
              </span>
              <h3 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                Generate & Use
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Copy or export your prompt and use it with any AI model. Save and share your prompts with your team for consistent results.
            </p>
          </div>
        </div>

        {/* Features Section 
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              "AI-Powered Generation",
              "Custom Templates",
              "Team Sharing",
              "Version Control",
              "Export Options",
              "Quick Suggestions"
            ].map((feature, index) => (
              <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800 
                                      border border-slate-200/50 dark:border-slate-700/50">
                <p className="font-medium text-slate-700 dark:text-slate-300">{feature}</p>
              </div>
            ))}
          </div>
        </div>*/}
      </div>
    </div>
  )
}
