"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const emptyStateVariants = cva(
  "relative flex flex-col items-center justify-center text-center p-8 rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-muted/50",
        card: "bg-card border shadow-sm",
        ghost: "bg-transparent",
      },
      size: {
        default: "p-8 gap-4",
        sm: "p-4 gap-2",
        lg: "p-12 gap-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactElement<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant, size, icon, title, description, action, secondaryAction, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size, className }))}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-muted-foreground">
            {React.cloneElement(icon, {
              className: cn("h-12 w-12", icon.props.className),
            })}
          </div>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-[20rem]">
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {action && (
              <Button onClick={action.onClick} size="sm">
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="ghost"
                onClick={secondaryAction.onClick}
                size="sm"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants } 