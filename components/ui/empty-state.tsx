import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('state-card', className)}>
      <span className="icon-tile mx-auto h-12 w-12">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-h4 text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
