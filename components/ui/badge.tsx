import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/25 bg-primary/10 text-primary hover:bg-primary/20",
        solid:
          "border-transparent bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]",
        secondary:
          "border-border bg-muted text-muted-foreground hover:bg-muted/80",
        outline:
          "border-border text-muted-foreground",
        success:
          "border-success/25 bg-success/10 text-success",
        warning:
          "border-warning/25 bg-warning/15 text-warning",
        destructive:
          "border-destructive/25 bg-destructive/10 text-destructive",
        info:
          "border-info/25 bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
