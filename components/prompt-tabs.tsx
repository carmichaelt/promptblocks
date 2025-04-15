"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { PromptTemplate as BasePromptTemplate } from "@/lib/prompt-config"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Extend the base PromptTemplate type with additional properties
interface ExtendedPromptTemplate extends BasePromptTemplate {
  isAdditional?: boolean
}

interface TabButtonProps {
  template: ExtendedPromptTemplate
  isActive: boolean
  onClick: () => void
}

interface PromptTabsProps {
  templates: ExtendedPromptTemplate[]
  activeTemplateId: string
  onTemplateSelect: (template: ExtendedPromptTemplate) => void
}

const TabButton = React.forwardRef<
  HTMLButtonElement,
  TabButtonProps
>(({ template, isActive, onClick }, ref) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          onClick={onClick}
          className={cn(
            "tab-button relative px-4 py-2 rounded-lg text-sm font-medium transition-all",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
            "tab-appear",
            isActive
              ? "text-violet-600 dark:text-violet-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          {template.name}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="tab-indicator absolute left-0 right-0"
              initial={false}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="max-w-[200px] text-sm"
      >
        {template.description}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
))

TabButton.displayName = "TabButton"

export function PromptTabs({ templates, activeTemplateId, onTemplateSelect }: PromptTabsProps) {
  const mainTemplates = templates.filter(t => !t.isAdditional)
  const additionalTemplates = templates.filter(t => t.isAdditional)

  return (
    <div className="space-y-4">
      <div className="tab-container">
        <div className="grid grid-cols-3 gap-2">
          {mainTemplates.map((template) => (
            <TabButton
              key={template.name}
              template={template}
              isActive={activeTemplateId === template.id}
              onClick={() => onTemplateSelect(template)}
            />
          ))}
        </div>
      </div>
      
      {additionalTemplates.length > 0 && (
        <div className="tab-container">
          <div className="grid grid-cols-2 gap-2">
            {additionalTemplates.map((template) => (
              <TabButton
                key={template.name}
                template={template}
                isActive={activeTemplateId === template.id}
                onClick={() => onTemplateSelect(template)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 