"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PromptBuilder from "@/components/prompt-builder"
import SimplePromptInput from "@/components/simple-prompt-input"
import type { PromptBlock } from "@/types/prompt-types"
import { Book } from "@/components/ui/book"
import { Boxes } from "@/components/ui/background-boxes"
import { cn } from "@/lib/utils"
import { DIcons } from 'dicons'

// Assuming you have a way to get available models, e.g., from config
// Replace with your actual model fetching/config logic
const availableModels = ["grok-3-mini", "grok-3-large", "gpt-4", "claude-3"]

// Added Demo Component Definition
function BackgroundBoxesDemo() {
  return (
    <div className="h-96 relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg mt-12">
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"simple" | "builder">("simple")
  const [builderInitialData, setBuilderInitialData] = useState<{
    templateId: string
    blocks: PromptBlock[]
  } | null>(null)
  const [selectedModel, setSelectedModel] = useState(availableModels[0]) // Default model

  const handleSimplePromptGeneration = (data: {
    templateId: string
    blocks: PromptBlock[]
  }) => {
    setBuilderInitialData(data)
    setActiveTab("builder") // Switch to builder tab
  }

  // Reset initial data when switching away from builder manually
  // This prevents re-initializing with old data if user switches back
  useEffect(() => {
    if (activeTab !== 'builder') {
      setBuilderInitialData(null);
    }
  }, [activeTab]);

  return (
    <div className="container relative mx-auto px-4 py-8 bg-white/80 shadow-md border border-slate-200 min-h-screen">
      <div className="absolute top-6 left-6 z-10">
        <a
          href="https://cloud.google.com/discover/what-is-prompt-engineering"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Learn more about prompting from Google's Prompt Engineering for AI Guide"
        >
          <Book
            width={80}
            depth={3}
            color="hsl(300, 100%, 80%)" //should be light pink like the title?
            //textColor="hsl(var(--card-foreground))"
          >
            <div className="p-2 grid gap-1 text-center">
              <p className="text-xs font-medium">Learn More</p>
              <DIcons.Designali className="w-4 h-4 mx-auto" />
            </div>
          </Book>
        </a>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500">
          PromptBlocks
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          Build powerful AI prompts using simple goals or specialized blocks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "simple" | "builder")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="simple">Simple Start</TabsTrigger>
          <TabsTrigger value="builder">Advanced Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          {activeTab === "simple" && (
            <SimplePromptInput
              onGenerationComplete={handleSimplePromptGeneration}
              availableModels={availableModels}
              selectedModel={selectedModel}
            />
          )}
        </TabsContent>

        <TabsContent value="builder">
          <PromptBuilder
             key={builderInitialData ? `builder-${builderInitialData.templateId}-${Date.now()}` : 'builder-default'}
             initialTemplateId={builderInitialData?.templateId}
             initialBlocks={builderInitialData?.blocks}
             selectedModelFromParent={selectedModel}
             onModelChangeFromParent={setSelectedModel}
          />
        </TabsContent>
      </Tabs>

    </div>
  )
}
