import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type LoadingStateProps = {
  label?: string
  variant?: 'spinner' | 'skeleton'
  className?: string
}

export function LoadingState({
  label = 'Loading...',
  variant = 'spinner',
  className,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('surface-card p-6', className)} aria-busy="true" aria-label={label}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('flex min-h-[50vh] items-center justify-center px-4', className)}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="surface-card flex flex-col items-center px-8 py-7 text-center">
        <span className="icon-tile h-12 w-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
        <p className="mt-4 text-body-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
