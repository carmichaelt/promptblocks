"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const aiModels = [
  {
    value: "grok-3-mini",
    label: "Grok 3 Mini",
    description: "Fast responses with good quality",
    provider: "xAI",
    strengths: ["Speed", "Efficiency", "General knowledge"],
  },
  {
    value: "grok-3-beta",
    label: "Grok 3",
    description: "High quality responses with advanced reasoning",
    provider: "xAI",
    strengths: ["Reasoning", "Creativity", "Technical knowledge"],
  },
]

interface AIModelSelectorProps {
  onModelChange: (model: string) => void
  selectedModel: string
}

export default function AIModelSelector({ onModelChange, selectedModel }: AIModelSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedModelData = aiModels.find((model) => model.value === selectedModel) || aiModels[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            <span>{selectedModelData.label}</span>
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {selectedModelData.provider}
            </Badge>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search AI models..." />
          <CommandList>
            <CommandEmpty>No AI model found.</CommandEmpty>
            <CommandGroup>
              {aiModels.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => {
                    onModelChange(model.value)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedModel === model.value ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span>{model.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{model.description}</span>
                    <div className="flex gap-1 mt-1">
                      {model.strengths.map((strength) => (
                        <Badge key={strength} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
