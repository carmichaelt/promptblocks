import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BlockConfig } from "@/lib/prompt-config"

interface BlockInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockConfig: BlockConfig
}

export default function BlockInfoDialog({
  open,
  onOpenChange,
  blockConfig,
}: BlockInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{blockConfig.title}</DialogTitle>
          <DialogDescription>{blockConfig.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 h-full">
          <div className="space-y-6 pr-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
              <ul className="list-disc pl-5 space-y-2">
                {blockConfig.bestPractices.map((practice, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Examples</h3>
              <ul className="list-disc pl-5 space-y-2">
                {blockConfig.examples.map((example, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 