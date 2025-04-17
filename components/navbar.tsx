import { Save, Share2, Download, Upload, Copy, Check, Sparkles, InfoIcon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButtonGroup, IconButton } from "@/components/ui/icon-button-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import KeyboardShortcutsGuide from "./keyboard-shortcuts-guide"
import { cn } from "@/lib/utils"
import type { PromptTemplate } from "@/types/prompt-types"

interface NavbarProps {
  activeTemplate: string
  templates: PromptTemplate[]
  onTemplateChange: (templateId: string) => void
  onSaveLoad: () => void
  onShare: () => void
  onExport: () => void
  onImport: () => void
  onGenerateAll: () => void
  isGenerating: boolean
  isCopied: boolean
}

export function Navbar({
  activeTemplate,
  templates,
  onTemplateChange,
  onSaveLoad,
  onShare,
  onExport,
  onImport,
  onGenerateAll,
  isGenerating,
  isCopied,
}: NavbarProps) {
  return (
    <div className="relative md:sticky top-0 z-50 w-full">
      <div className="container mx-auto px-0 md:px-4">
        <div className="flex flex-col md:flex-row md:h-16 py-3 md:py-0 gap-3 md:gap-4 md:justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          {/* Template Selection - Full width on mobile, normal width on desktop */}
          <div className="flex items-center w-full md:w-[300px]">
            <Select value={activeTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-600 shadow-sm">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id} className="cursor-pointer">
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions - Row for desktop, Dropdown for mobile */}
          <div className="flex items-center justify-end gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateAll}
                disabled={isGenerating}
                className="bg-white/90 dark:bg-slate-600 min-w-[120px]"
              >
                <Sparkles size={16} className="mr-2" />
                Generate
              </Button>

              <IconButtonGroup
                buttons={[
                  {
                    icon: <Save size={16} />,
                    label: "Save/Load",
                    onClick: onSaveLoad,
                  },
                  {
                    icon: <Share2 size={16} />,
                    label: "Share",
                    onClick: onShare,
                  },
                  {
                    icon: <Download size={16} />,
                    label: "Export",
                    onClick: onExport,
                  },
                  {
                    icon: <Upload size={16} />,
                    label: "Import",
                    onClick: onImport,
                  },
                  {
                    icon: <InfoIcon size={16} />,
                    label: "Shortcuts",
                    onClick: () => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="shortcuts"]')?.click(),
                  },
                ]}
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateAll}
                disabled={isGenerating}
                className="flex-1 bg-white/90 dark:bg-slate-600"
              >
                <Sparkles size={16} className="mr-2" />
                Generate
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white/90 dark:bg-slate-600">
                    <Menu size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={onSaveLoad}>
                    <Save size={16} className="mr-2" />
                    Save/Load
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 size={16} className="mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download size={16} className="mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onImport}>
                    <Upload size={16} className="mr-2" />
                    Import
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="shortcuts"]')?.click()}>
                    <InfoIcon size={16} className="mr-2" />
                    Shortcuts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="hidden" data-dialog-trigger="shortcuts">Shortcuts</button>
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
    </div>
  )
} 