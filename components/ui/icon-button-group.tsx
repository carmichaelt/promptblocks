import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface IconButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: "default" | "outline" | "ghost"
}

interface IconButtonGroupProps {
  buttons: IconButtonProps[]
  className?: string
}

export function IconButton({ icon, label, onClick, disabled, variant = "outline" }: IconButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 bg-white/90 dark:bg-slate-800/90 transition-all duration-200",
        "flex items-center gap-2 px-2 w-full justify-start"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-sm">{label}</span>
    </Button>
  )
}

export function IconButtonGroup({ buttons, className }: IconButtonGroupProps) {
  const [open, setOpen] = React.useState(false)

  const handleValueChange = (value: string) => {
    const index = parseInt(value.replace('action-', ''))
    if (!isNaN(index) && buttons[index]) {
      buttons[index].onClick()
    }
    setOpen(false) // Close the select after action
  }

  return (
    <div className={cn("relative", className)}>
      <Select 
        open={open} 
        onOpenChange={setOpen}
        onValueChange={handleValueChange}
        value=""
      >
        <SelectTrigger className="h-8 w-[130px] bg-white/90 dark:bg-slate-800/90">
          <Settings size={16} className="mr-2" />
          <span>Actions</span>
        </SelectTrigger>
        <SelectContent align="end" className="w-[200px]">
          {buttons.map((button, index) => (
            <SelectItem
              key={index}
              value={`action-${index}`}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {button.icon}
                <span>{button.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 