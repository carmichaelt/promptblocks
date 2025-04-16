import { Save, Share2, Download, Upload, Copy, Check, Sparkles, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButtonGroup, IconButton } from "@/components/ui/icon-button-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  onCopy: () => void
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
  onCopy,
  isGenerating,
  isCopied,
}: NavbarProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Left side - Template Selection */}
          <div className="flex items-center gap-4 flex-1 min-w-[200px] max-w-xl">
            <Select value={activeTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-800 shadow-sm">
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

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Primary Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateAll}
              disabled={isGenerating}
              className="bg-white/90 dark:bg-slate-800/90 min-w-[120px]"
            >
              <Sparkles size={16} className="mr-2" />
              Generate
            </Button>

            <Button 
              onClick={onCopy} 
              size="sm" 
              className={cn(
                "shadow-sm transition-colors min-w-[100px]", 
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

            {/* Secondary Actions Dropdown */}
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
                  label: "Keyboard Shortcuts",
                  onClick: () => document.querySelector<HTMLButtonElement>('[data-dialog-trigger="shortcuts"]')?.click(),
                },
              ]}
            />
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