'use client'

import type React from 'react'
import {
  Bot,
  CheckCircle2,
  Clock,
  LucideIcon,
  Mic2,
  Palette,
  ServerCog,
  Target,
} from 'lucide-react'
import { DOMAINS, type Domain } from '@/lib/subjects'
import { cn } from '@/lib/utils'

export const domainIconMap: Record<Domain, LucideIcon> = {
  placement: Target,
  frontend: Palette,
  backend: ServerCog,
  aiml: Bot,
  'stax-interview': Mic2,
}

const domainBadgeStyles: Record<Domain, string> = {
  placement: 'border-primary/25 bg-primary/10 text-primary',
  frontend: 'border-success/25 bg-success/10 text-success',
  backend: 'border-info/25 bg-info/10 text-info',
  aiml: 'border-accent/25 bg-accent/10 text-accent',
  'stax-interview': 'border-warning/30 bg-warning/10 text-warning',
}

const statusStyles: Record<string, string> = {
  active: 'border-success/30 bg-success/10 text-success',
  upcoming: 'border-primary/30 bg-primary/10 text-primary',
  completed: 'border-border bg-muted text-muted-foreground',
}

type DomainFilterBarProps = {
  selectedDomain: Domain | 'all'
  onSelect: (domain: Domain | 'all') => void
  label?: string
  includeAll?: boolean
  className?: string
}

export function DomainIcon({ domain, className }: { domain: Domain; className?: string }) {
  const Icon = domainIconMap[domain]
  return <Icon className={cn('h-4 w-4', className)} />
}

export function DomainBadge({ domain, className }: { domain: Domain; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
        domainBadgeStyles[domain],
        className
      )}
    >
      <DomainIcon domain={domain} />
      {DOMAINS[domain]?.name}
    </span>
  )
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.toLowerCase()
  const Icon = normalized === 'active' ? CheckCircle2 : Clock

  return (
    <span
      className={cn(
        'inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold capitalize',
        statusStyles[normalized] ?? statusStyles.completed,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function DomainFilterBar({
  selectedDomain,
  onSelect,
  label = 'Filter by Domain',
  includeAll = true,
  className,
}: DomainFilterBarProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-caption font-semibold uppercase text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {includeAll && (
          <button
            type="button"
            onClick={() => onSelect('all')}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selectedDomain === 'all'
                ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                : 'border-border bg-card/80 text-muted-foreground hover:border-border-strong hover:bg-muted hover:text-foreground'
            )}
          >
            All Domains
          </button>
        )}
        {(Object.keys(DOMAINS) as Domain[]).map((domainId) => {
          const domain = DOMAINS[domainId]
          const isSelected = selectedDomain === domainId
          const Icon = domainIconMap[domainId]

          return (
            <button
              key={domainId}
              type="button"
              onClick={() => onSelect(domainId)}
              className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                  : 'border-border bg-card/80 text-muted-foreground hover:border-border-strong hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{domain.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

type ModeTab<T extends string> = {
  value: T
  label: string
  icon?: LucideIcon
}

export function ModeTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: ModeTab<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-surface-1/80 p-1 shadow-soft', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isSelected = value === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function CompetitionHeader({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}) {
  return (
    <header className={cn('flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex items-start gap-4">
        <span className="icon-tile h-14 w-14">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-h1 text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-body-lg text-muted-foreground">{description}</p>
        </div>
      </div>
    </header>
  )
}

export function MetricRow({
  icon: Icon,
  children,
  tone = 'primary',
}: {
  icon: LucideIcon
  children: React.ReactNode
  tone?: 'primary' | 'success' | 'warning' | 'info'
}) {
  const toneClasses = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
  }

  return (
    <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
      <Icon className={cn('h-4 w-4 shrink-0', toneClasses[tone])} />
      <span>{children}</span>
    </div>
  )
}
