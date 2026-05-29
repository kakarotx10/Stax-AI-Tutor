'use client'

import { useParams, useRouter } from 'next/navigation'
import { SUBJECTS, type Subject } from '@/lib/subjects'
import { ArrowLeft, Lock, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.subjectId as Subject
  const subject = SUBJECTS[subjectId]

  if (!subject) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Subject not found.</p>
      </div>
    )
  }

  const handleUnitClick = (unitId: string) => {
    const unit = subject.units.find((u) => u.id === unitId)
    if (unit?.locked) return
    router.push(`/subject/${subjectId}/unit/${unitId}/journey`)
  }

  const totalXP = subject.units.reduce((sum, u) => sum + u.xpReward, 0)
  const completedCount = subject.units.filter((u) => u.completed).length

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12 lg:px-8">
        {/* Back link */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mb-10 inline-flex items-center gap-2 text-body-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All paths
        </button>

        {/* Header */}
        <header className="mb-14">
          <p className="mb-3 text-eyebrow uppercase text-muted-foreground">
            {subject.domain === 'placement'
              ? 'Placement track'
              : subject.domain === 'frontend'
              ? 'Frontend track'
              : subject.domain === 'backend'
              ? 'Backend track'
              : subject.domain === 'aiml'
              ? 'AI / ML track'
              : 'Track'}
          </p>
          <h1 className="text-h1 text-foreground">{subject.name}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">
            {subject.units.length} units · {totalXP} XP total
            {completedCount > 0 ? ` · ${completedCount} completed` : ''}
          </p>
        </header>

        {/* Unit list */}
        <ul className="space-y-3">
          {subject.units.map((unit, idx) => {
            const completed = !!unit.completed
            const locked = !!unit.locked && !completed
            const interactive = !locked

            return (
              <li key={unit.id}>
                <button
                  type="button"
                  onClick={() => handleUnitClick(unit.id)}
                  disabled={!interactive}
                  className={cn(
                    'group relative flex w-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-soft transition-all duration-150 ease-out-quart',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    interactive &&
                      'hover:-translate-y-px hover:border-[hsl(var(--border-strong))] hover:bg-[hsl(var(--card))] hover:shadow-card',
                    !interactive && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {/* Top row: unit index + state pill */}
                  <div className="flex items-center justify-between">
                    <span className="text-eyebrow uppercase text-muted-foreground">
                      Unit · {String(idx + 1).padStart(2, '0')}
                    </span>

                    {completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-success/25 bg-success/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Done
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-primary">
                        Available
                      </span>
                    )}
                  </div>

                  {/* Title + description */}
                  <div>
                    <h2 className="text-h4 font-semibold tracking-tight text-foreground">
                      {unit.name}
                    </h2>
                    <p className="mt-1.5 text-body-sm text-muted-foreground">
                      {unit.description}
                    </p>
                  </div>

                  {/* Subtopic chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {unit.subtopics.slice(0, 4).map((subtopic) => (
                      <span
                        key={subtopic.id}
                        className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {subtopic.name}
                      </span>
                    ))}
                    {unit.subtopics.length > 4 && (
                      <span className="text-[11px] font-medium text-muted-foreground">
                        +{unit.subtopics.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="font-medium tabular-nums text-foreground">
                        {unit.xpReward}
                      </span>{' '}
                      XP
                    </span>

                    {interactive && (
                      <span className="inline-flex items-center gap-1 text-body-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {completed ? 'Review' : 'Start'}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
