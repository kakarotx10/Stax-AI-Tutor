'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-28 w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm leading-6 text-foreground shadow-soft transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {error && <p className="mt-1.5 text-caption text-destructive">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
