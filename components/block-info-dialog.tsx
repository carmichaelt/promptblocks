import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BlockConfig } from "@/lib/prompt-config"
import { Info, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface BlockInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockConfig: BlockConfig
  color: string
}

export default function BlockInfoDialog({
  open,
  onOpenChange,
  blockConfig,
  color,
}: BlockInfoDialogProps) {

  const handleCopyExample = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Example copied to clipboard!",
        description: "You can now paste it into your prompt.",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Failed to copy example.",
        description: "Please try again manually.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className={cn("flex items-center gap-2 text-lg", color.replace("bg-", "text-"))}>
            <Info size={18} className={cn(color.replace("bg-", "text-"))} />
            {blockConfig.title}
          </DialogTitle>
          <DialogDescription>{blockConfig.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-y-auto px-6 pb-6">
          <Card className="shadow-none border-none">
            <CardContent className="space-y-4 p-0 bg-slate-50 dark:bg-slate-800">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Best Practices
                </h3>
                <ul className="grid gap-2 pl-5">
                  {blockConfig.bestPractices.map((practice, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Examples</h3>
                <div className="grid gap-2">
                  {blockConfig.examples.map((example, index) => (
                    <div
                      key={index}
                      onClick={() => handleCopyExample(example)}
                      className={cn(
                        "text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 font-mono",
                        "cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Badge variant="outline" className="text-xs">
                  Block Type: <span className={cn("ml-2", color.replace("bg-", "text-"))}>{blockConfig.type}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 

