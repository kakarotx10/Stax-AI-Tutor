import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  showWordmark?: boolean
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/mark.svg"
      alt=""
      aria-hidden="true"
      className={cn('h-9 w-9 shrink-0', className)}
    />
  )
}

export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
}: BrandLogoProps) {
  if (!showWordmark) {
    return (
      <span className={cn('inline-flex items-center', className)}>
        <BrandMark className={markClassName} />
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <span className={cn('relative inline-flex h-8 w-32 items-center', wordmarkClassName)}>
        <img
          src="/brand/logo-horizontal-light.svg"
          alt="Stax AI"
          className="h-full w-auto dark:hidden"
          decoding="async"
        />
        <img
          src="/brand/logo-horizontal-dark.svg"
          alt="Stax AI"
          className="hidden h-full w-auto dark:block"
          decoding="async"
        />
      </span>
    </span>
  )
}
