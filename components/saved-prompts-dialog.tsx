import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, Trash2 } from "lucide-react"
import type { PromptTemplate } from "@/lib/prompt-config"

interface SavedPromptsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoad: (template: PromptTemplate) => void
  onSave: (name: string) => void
  savedPrompts: { name: string; template: PromptTemplate }[]
  onDelete: (name: string) => void
}

export default function SavedPromptsDialog({
  open,
  onOpenChange,
  onLoad,
  onSave,
  savedPrompts,
  onDelete,
}: SavedPromptsDialogProps) {
  const [newPromptName, setNewPromptName] = useState("")

  const handleSave = () => {
    if (newPromptName.trim()) {
      onSave(newPromptName.trim())
      setNewPromptName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Saved Prompts</DialogTitle>
          <DialogDescription>Load a saved prompt or save your current prompt configuration</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Enter prompt name..."
            value={newPromptName}
            onChange={(e) => setNewPromptName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <Button onClick={handleSave} disabled={!newPromptName.trim()}>
            <Save size={16} className="mr-2" />
            Save Current
          </Button>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {savedPrompts.map(({ name, template }) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {template.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoad(template)}
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => onDelete(name)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            {savedPrompts.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No saved prompts yet. Save your current configuration to get started.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 